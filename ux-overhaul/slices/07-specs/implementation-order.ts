/**
 * Implementation Order Calculator for UX Overhaul Skill
 * Calculates optimal build sequence based on screen dependencies and flows
 */

import { ScreenSpec } from './screen-spec-generator';
import { ScreenType } from './component-mapper';

// ============================================================================
// Types
// ============================================================================

/**
 * Complete implementation order result
 */
export interface ImplementationOrder {
  phases: ImplementationPhase[];
  totalScreens: number;
  criticalPath: string[];
  recommendedParallelization: string[][];
}

/**
 * Single implementation phase
 */
export interface ImplementationPhase {
  phase: number;
  name: string;
  screens: string[];
  description: string;
  dependencies: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
}

/**
 * Dependency graph node
 */
export interface DependencyNode {
  screenId: string;
  screenType: ScreenType;
  dependencies: string[];
  dependents: string[];
  complexity: 'low' | 'medium' | 'high';
}

/**
 * Dependency graph structure
 */
export interface DependencyGraph {
  nodes: Map<string, DependencyNode>;
  edges: Array<{ from: string; to: string }>;
}

/**
 * App understanding structure (from earlier phases)
 */
export interface AppUnderstanding {
  screens: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  flows: Array<{
    name: string;
    screens: string[];
  }>;
}

// ============================================================================
// Phase Definitions
// ============================================================================

/**
 * Phase template definitions
 */
const PHASE_TEMPLATES: Record<string, { name: string; description: string }> = {
  foundation: {
    name: 'Foundation',
    description: 'Core layout, navigation, and shared components'
  },
  authentication: {
    name: 'Authentication',
    description: 'Login, registration, and authentication flows'
  },
  core: {
    name: 'Core Functionality',
    description: 'Main application features and primary user flows'
  },
  secondary: {
    name: 'Secondary Features',
    description: 'Settings, preferences, and auxiliary screens'
  },
  enhancement: {
    name: 'Enhancement',
    description: 'Polish, empty states, error handling, and edge cases'
  }
};

/**
 * Screen type to phase mapping
 */
const SCREEN_TYPE_PRIORITY: Record<ScreenType, number> = {
  landing: 1,
  auth: 2,
  dashboard: 3,
  list: 4,
  detail: 5,
  form: 5,
  settings: 6,
  modal: 7,
  empty: 8,
  error: 8,
  generic: 5
};

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Calculates optimal implementation order for screens
 */
export function calculateImplementationOrder(
  screenSpecs: ScreenSpec[],
  appUnderstanding?: AppUnderstanding
): ImplementationOrder {
  // Build dependency graph
  const graph = buildDependencyGraph(screenSpecs, appUnderstanding);

  // Perform topological sort
  const sortedScreens = topologicalSort(graph);

  // Group into phases
  const phases = groupIntoPhases(sortedScreens, graph, screenSpecs);

  // Calculate critical path
  const criticalPath = identifyCriticalPath(graph, screenSpecs);

  // Suggest parallelization
  const recommendedParallelization = suggestParallelization(phases, graph);

  return {
    phases,
    totalScreens: screenSpecs.length,
    criticalPath,
    recommendedParallelization
  };
}

/**
 * Builds dependency graph from screen specs and app understanding
 */
export function buildDependencyGraph(
  screenSpecs: ScreenSpec[],
  appUnderstanding?: AppUnderstanding
): DependencyGraph {
  const nodes = new Map<string, DependencyNode>();
  const edges: Array<{ from: string; to: string }> = [];

  // Create nodes for each screen
  for (const spec of screenSpecs) {
    nodes.set(spec.screenId, {
      screenId: spec.screenId,
      screenType: spec.screenType as ScreenType,
      dependencies: [],
      dependents: [],
      complexity: spec.estimatedComplexity || 'medium'
    });
  }

  // Derive dependencies from flows
  if (appUnderstanding?.flows) {
    for (const flow of appUnderstanding.flows) {
      // Screens earlier in a flow are dependencies of later screens
      for (let i = 1; i < flow.screens.length; i++) {
        const fromScreen = flow.screens[i - 1];
        const toScreen = flow.screens[i];

        if (nodes.has(fromScreen) && nodes.has(toScreen)) {
          const fromNode = nodes.get(fromScreen)!;
          const toNode = nodes.get(toScreen)!;

          if (!toNode.dependencies.includes(fromScreen)) {
            toNode.dependencies.push(fromScreen);
            fromNode.dependents.push(toScreen);
            edges.push({ from: fromScreen, to: toScreen });
          }
        }
      }
    }
  }

  // Add implicit dependencies based on screen types
  addImplicitDependencies(nodes, edges);

  return { nodes, edges };
}

/**
 * Adds implicit dependencies based on screen type relationships
 */
function addImplicitDependencies(
  nodes: Map<string, DependencyNode>,
  edges: Array<{ from: string; to: string }>
): void {
  const screensByType = new Map<ScreenType, string[]>();

  // Group screens by type
  for (const [id, node] of nodes) {
    const type = node.screenType;
    if (!screensByType.has(type)) {
      screensByType.set(type, []);
    }
    screensByType.get(type)!.push(id);
  }

  // Auth screens are dependencies for most other screens
  const authScreens = screensByType.get('auth') || [];
  const landingScreens = screensByType.get('landing') || [];

  for (const [id, node] of nodes) {
    // Non-auth, non-landing screens depend on auth screens
    if (node.screenType !== 'auth' && node.screenType !== 'landing') {
      for (const authId of authScreens) {
        if (!node.dependencies.includes(authId)) {
          node.dependencies.push(authId);
          nodes.get(authId)!.dependents.push(id);
          edges.push({ from: authId, to: id });
        }
      }
    }

    // Auth screens depend on landing screens
    if (node.screenType === 'auth') {
      for (const landingId of landingScreens) {
        if (!node.dependencies.includes(landingId)) {
          node.dependencies.push(landingId);
          nodes.get(landingId)!.dependents.push(id);
          edges.push({ from: landingId, to: id });
        }
      }
    }

    // Detail screens typically depend on list screens
    if (node.screenType === 'detail') {
      const listScreens = screensByType.get('list') || [];
      for (const listId of listScreens) {
        if (!node.dependencies.includes(listId)) {
          node.dependencies.push(listId);
          nodes.get(listId)!.dependents.push(id);
          edges.push({ from: listId, to: id });
        }
      }
    }

    // Modal screens typically depend on their parent screens (dashboard/detail)
    if (node.screenType === 'modal') {
      const dashboardScreens = screensByType.get('dashboard') || [];
      for (const dashId of dashboardScreens) {
        if (!node.dependencies.includes(dashId)) {
          node.dependencies.push(dashId);
          nodes.get(dashId)!.dependents.push(id);
          edges.push({ from: dashId, to: id });
        }
      }
    }
  }
}

/**
 * Performs topological sort on the dependency graph
 */
export function topologicalSort(graph: DependencyGraph): string[] {
  const sorted: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(nodeId: string): void {
    if (visited.has(nodeId)) return;
    if (visiting.has(nodeId)) {
      // Cycle detected - skip to avoid infinite loop
      return;
    }

    visiting.add(nodeId);
    const node = graph.nodes.get(nodeId);

    if (node) {
      for (const depId of node.dependencies) {
        visit(depId);
      }
    }

    visiting.delete(nodeId);
    visited.add(nodeId);
    sorted.push(nodeId);
  }

  // Visit all nodes
  for (const nodeId of graph.nodes.keys()) {
    visit(nodeId);
  }

  return sorted;
}

/**
 * Groups sorted screens into implementation phases
 */
export function groupIntoPhases(
  sortedScreens: string[],
  graph: DependencyGraph,
  screenSpecs: ScreenSpec[]
): ImplementationPhase[] {
  const phases: ImplementationPhase[] = [];
  const screenSpecMap = new Map(screenSpecs.map(s => [s.screenId, s]));

  // Phase 1: Foundation (landing, dashboard)
  const foundationScreens = sortedScreens.filter(id => {
    const node = graph.nodes.get(id);
    return node && ['landing', 'dashboard'].includes(node.screenType);
  });

  if (foundationScreens.length > 0) {
    phases.push({
      phase: 1,
      name: PHASE_TEMPLATES.foundation.name,
      screens: foundationScreens,
      description: PHASE_TEMPLATES.foundation.description,
      dependencies: [],
      estimatedEffort: calculatePhaseEffort(foundationScreens, screenSpecMap)
    });
  }

  // Phase 2: Authentication
  const authScreens = sortedScreens.filter(id => {
    const node = graph.nodes.get(id);
    return node && node.screenType === 'auth';
  });

  if (authScreens.length > 0) {
    phases.push({
      phase: phases.length + 1,
      name: PHASE_TEMPLATES.authentication.name,
      screens: authScreens,
      description: PHASE_TEMPLATES.authentication.description,
      dependencies: foundationScreens,
      estimatedEffort: calculatePhaseEffort(authScreens, screenSpecMap)
    });
  }

  // Phase 3: Core (list, detail, form)
  const coreScreens = sortedScreens.filter(id => {
    const node = graph.nodes.get(id);
    return node && ['list', 'detail', 'form'].includes(node.screenType);
  });

  if (coreScreens.length > 0) {
    phases.push({
      phase: phases.length + 1,
      name: PHASE_TEMPLATES.core.name,
      screens: coreScreens,
      description: PHASE_TEMPLATES.core.description,
      dependencies: [...foundationScreens, ...authScreens],
      estimatedEffort: calculatePhaseEffort(coreScreens, screenSpecMap)
    });
  }

  // Phase 4: Secondary (settings, modal, generic)
  const secondaryScreens = sortedScreens.filter(id => {
    const node = graph.nodes.get(id);
    return node && ['settings', 'modal', 'generic'].includes(node.screenType);
  });

  if (secondaryScreens.length > 0) {
    phases.push({
      phase: phases.length + 1,
      name: PHASE_TEMPLATES.secondary.name,
      screens: secondaryScreens,
      description: PHASE_TEMPLATES.secondary.description,
      dependencies: [...coreScreens],
      estimatedEffort: calculatePhaseEffort(secondaryScreens, screenSpecMap)
    });
  }

  // Phase 5: Enhancement (empty, error)
  const enhancementScreens = sortedScreens.filter(id => {
    const node = graph.nodes.get(id);
    return node && ['empty', 'error'].includes(node.screenType);
  });

  if (enhancementScreens.length > 0) {
    phases.push({
      phase: phases.length + 1,
      name: PHASE_TEMPLATES.enhancement.name,
      screens: enhancementScreens,
      description: PHASE_TEMPLATES.enhancement.description,
      dependencies: [...coreScreens, ...secondaryScreens],
      estimatedEffort: calculatePhaseEffort(enhancementScreens, screenSpecMap)
    });
  }

  return phases;
}

/**
 * Calculates effort estimate for a phase
 */
function calculatePhaseEffort(
  screenIds: string[],
  screenSpecMap: Map<string, ScreenSpec>
): 'low' | 'medium' | 'high' {
  if (screenIds.length === 0) return 'low';

  let totalComplexity = 0;
  for (const id of screenIds) {
    const spec = screenSpecMap.get(id);
    const complexity = spec?.estimatedComplexity || 'medium';
    totalComplexity += complexity === 'high' ? 3 : complexity === 'medium' ? 2 : 1;
  }

  const avgComplexity = totalComplexity / screenIds.length;
  const screenFactor = screenIds.length > 3 ? 1 : 0;

  const totalScore = avgComplexity + screenFactor;

  if (totalScore >= 3) return 'high';
  if (totalScore >= 2) return 'medium';
  return 'low';
}

/**
 * Identifies the critical path (longest dependency chain)
 */
export function identifyCriticalPath(
  graph: DependencyGraph,
  screenSpecs: ScreenSpec[]
): string[] {
  const screenSpecMap = new Map(screenSpecs.map(s => [s.screenId, s]));
  let longestPath: string[] = [];

  function findLongestPath(nodeId: string, currentPath: string[]): void {
    currentPath.push(nodeId);

    const node = graph.nodes.get(nodeId);
    if (!node || node.dependents.length === 0) {
      // Leaf node - check if this is the longest path
      if (currentPath.length > longestPath.length) {
        longestPath = [...currentPath];
      }
    } else {
      for (const depId of node.dependents) {
        if (!currentPath.includes(depId)) {
          findLongestPath(depId, [...currentPath]);
        }
      }
    }
  }

  // Start from nodes with no dependencies (roots)
  for (const [nodeId, node] of graph.nodes) {
    if (node.dependencies.length === 0) {
      findLongestPath(nodeId, []);
    }
  }

  return longestPath;
}

/**
 * Suggests parallelization opportunities
 */
export function suggestParallelization(
  phases: ImplementationPhase[],
  graph: DependencyGraph
): string[][] {
  const parallelGroups: string[][] = [];

  for (const phase of phases) {
    // Find screens in this phase that don't depend on each other
    const independentGroups = findIndependentGroups(phase.screens, graph);
    parallelGroups.push(...independentGroups);
  }

  return parallelGroups;
}

/**
 * Finds groups of screens that can be built in parallel
 */
function findIndependentGroups(screenIds: string[], graph: DependencyGraph): string[][] {
  const groups: string[][] = [];

  if (screenIds.length <= 1) {
    if (screenIds.length === 1) {
      groups.push(screenIds);
    }
    return groups;
  }

  // Check which screens are independent of each other
  const independent = new Map<string, Set<string>>();

  for (const id of screenIds) {
    independent.set(id, new Set());
    const node = graph.nodes.get(id);

    for (const otherId of screenIds) {
      if (id === otherId) continue;

      const otherNode = graph.nodes.get(otherId);

      // Check if neither depends on the other
      const idDependsOnOther = node?.dependencies.includes(otherId);
      const otherDependsOnId = otherNode?.dependencies.includes(id);

      if (!idDependsOnOther && !otherDependsOnId) {
        independent.get(id)!.add(otherId);
      }
    }
  }

  // Greedily form groups of independent screens
  const assigned = new Set<string>();

  for (const id of screenIds) {
    if (assigned.has(id)) continue;

    const group = [id];
    assigned.add(id);

    const independentOf = independent.get(id)!;

    for (const otherId of independentOf) {
      if (assigned.has(otherId)) continue;

      // Check if otherId is independent of all current group members
      let canAdd = true;
      for (const groupMember of group) {
        if (!independent.get(otherId)?.has(groupMember)) {
          canAdd = false;
          break;
        }
      }

      if (canAdd) {
        group.push(otherId);
        assigned.add(otherId);
      }
    }

    groups.push(group);
  }

  return groups;
}

// ============================================================================
// Output Formatting
// ============================================================================

/**
 * Formats implementation order as markdown checklist
 */
export function formatImplementationChecklist(order: ImplementationOrder): string {
  const lines: string[] = [
    '# Implementation Checklist',
    '',
    `Total Screens: ${order.totalScreens}`,
    `Total Phases: ${order.phases.length}`,
    '',
    '---',
    ''
  ];

  // Phases
  for (const phase of order.phases) {
    lines.push(`## Phase ${phase.phase}: ${phase.name}`);
    lines.push('');
    lines.push(`*${phase.description}*`);
    lines.push('');
    lines.push(`**Estimated Effort**: ${phase.estimatedEffort}`);
    lines.push('');

    if (phase.dependencies.length > 0) {
      lines.push(`**Dependencies**: ${phase.dependencies.join(', ')}`);
      lines.push('');
    }

    lines.push('### Screens');
    lines.push('');
    for (const screen of phase.screens) {
      lines.push(`- [ ] ${screen}`);
    }
    lines.push('');
  }

  // Critical path
  if (order.criticalPath.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push('## Critical Path');
    lines.push('');
    lines.push('The following screens form the longest dependency chain:');
    lines.push('');
    lines.push(order.criticalPath.map((s, i) => `${i + 1}. ${s}`).join('\n'));
    lines.push('');
  }

  // Parallelization
  if (order.recommendedParallelization.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push('## Parallelization Opportunities');
    lines.push('');
    lines.push('The following groups of screens can be built in parallel:');
    lines.push('');
    for (let i = 0; i < order.recommendedParallelization.length; i++) {
      const group = order.recommendedParallelization[i];
      if (group.length > 1) {
        lines.push(`**Group ${i + 1}**: ${group.join(' + ')}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Gets phase by number
 */
export function getPhaseByNumber(order: ImplementationOrder, phaseNumber: number): ImplementationPhase | undefined {
  return order.phases.find(p => p.phase === phaseNumber);
}

/**
 * Gets screens for a specific phase
 */
export function getScreensForPhase(order: ImplementationOrder, phaseName: string): string[] {
  const phase = order.phases.find(p => p.name.toLowerCase() === phaseName.toLowerCase());
  return phase?.screens || [];
}

/**
 * Checks if a screen is on the critical path
 */
export function isOnCriticalPath(order: ImplementationOrder, screenId: string): boolean {
  return order.criticalPath.includes(screenId);
}

/**
 * Gets implementation priority for a screen (lower = higher priority)
 */
export function getScreenPriority(order: ImplementationOrder, screenId: string): number {
  for (const phase of order.phases) {
    const index = phase.screens.indexOf(screenId);
    if (index >= 0) {
      return phase.phase * 100 + index;
    }
  }
  return 9999;
}
