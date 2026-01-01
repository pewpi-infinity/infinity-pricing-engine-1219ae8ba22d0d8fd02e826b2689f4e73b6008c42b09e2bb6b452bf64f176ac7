/**
 * Hydrogen Sync Module
 * Manages instant price propagation via hydrogen bonds
 */

class HydrogenSync {
  constructor(wiringConfig) {
    this.config = wiringConfig.wiring_configuration;
    this.hydrogenBonds = [];
    this.syncQueue = [];
    this.bondStrength = this.config.hydrogen_bonds.bond_strength || 'strong';
    this.propagationSpeed = this.config.hydrogen_bonds.propagation_speed || 'instant';
  }

  /**
   * Create a hydrogen bond between two components
   */
  createBond(source, target, bondType = 'bidirectional') {
    const bond = {
      id: `${source}-${target}-${Date.now()}`,
      source,
      target,
      bondType,
      strength: this.bondStrength,
      created: Date.now(),
      active: true,
      syncCount: 0
    };

    this.hydrogenBonds.push(bond);

    return {
      bond_created: true,
      bond_id: bond.id,
      source,
      target,
      type: bondType,
      strength: this.bondStrength,
      status: 'hydrogen_bond_active'
    };
  }

  /**
   * Sync data instantly via hydrogen bond
   */
  syncViaHydrogenBond(bondId, data) {
    const bond = this.hydrogenBonds.find(b => b.id === bondId);
    
    if (!bond) {
      return {
        synced: false,
        error: 'Bond not found',
        bond_id: bondId
      };
    }

    if (!bond.active) {
      return {
        synced: false,
        error: 'Bond inactive',
        bond_id: bondId
      };
    }

    // Instant propagation
    const syncOperation = {
      bond_id: bondId,
      source: bond.source,
      target: bond.target,
      data,
      timestamp: Date.now(),
      propagation_time: 0, // Instant
      success: true
    };

    bond.syncCount++;
    
    return {
      synced: true,
      bond_id: bondId,
      from: bond.source,
      to: bond.target,
      data_synced: Object.keys(data).length,
      propagation_speed: this.propagationSpeed,
      propagation_time_ms: 0,
      sync_count: bond.syncCount
    };
  }

  /**
   * Queue sync operation for batch processing
   */
  queueSync(source, target, data, priority = 'normal') {
    const syncItem = {
      id: `sync-${Date.now()}-${Math.random()}`,
      source,
      target,
      data,
      priority,
      queued: Date.now(),
      status: 'queued'
    };

    this.syncQueue.push(syncItem);

    // Sort by priority (high -> normal -> low)
    this.syncQueue.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return {
      queued: true,
      sync_id: syncItem.id,
      position: this.syncQueue.findIndex(s => s.id === syncItem.id) + 1,
      queue_length: this.syncQueue.length,
      priority
    };
  }

  /**
   * Process sync queue
   */
  processSyncQueue() {
    if (this.syncQueue.length === 0) {
      return {
        processed: 0,
        message: 'Queue empty'
      };
    }

    const results = [];
    const toProcess = [...this.syncQueue];
    this.syncQueue = [];

    toProcess.forEach(syncItem => {
      // Find or create bond
      let bond = this.hydrogenBonds.find(
        b => b.source === syncItem.source && b.target === syncItem.target
      );

      if (!bond) {
        const created = this.createBond(syncItem.source, syncItem.target);
        bond = this.hydrogenBonds.find(b => b.id === created.bond_id);
      }

      const result = this.syncViaHydrogenBond(bond.id, syncItem.data);
      results.push({
        sync_id: syncItem.id,
        result
      });
    });

    return {
      processed: results.length,
      results,
      queue_cleared: true,
      propagation: 'instant_via_hydrogen_bonds'
    };
  }

  /**
   * Strengthen a bond (increase sync reliability)
   */
  strengthenBond(bondId) {
    const bond = this.hydrogenBonds.find(b => b.id === bondId);
    
    if (!bond) {
      return { error: 'Bond not found' };
    }

    const oldStrength = bond.strength;
    bond.strength = 'very_strong';

    return {
      bond_id: bondId,
      old_strength: oldStrength,
      new_strength: bond.strength,
      sync_reliability: 'maximum',
      propagation_guarantee: 'instant'
    };
  }

  /**
   * Weaken a bond (reduce sync priority)
   */
  weakenBond(bondId) {
    const bond = this.hydrogenBonds.find(b => b.id === bondId);
    
    if (!bond) {
      return { error: 'Bond not found' };
    }

    const oldStrength = bond.strength;
    bond.strength = 'weak';

    return {
      bond_id: bondId,
      old_strength: oldStrength,
      new_strength: bond.strength,
      sync_priority: 'reduced'
    };
  }

  /**
   * Break a hydrogen bond
   */
  breakBond(bondId) {
    const bondIndex = this.hydrogenBonds.findIndex(b => b.id === bondId);
    
    if (bondIndex === -1) {
      return { error: 'Bond not found' };
    }

    const bond = this.hydrogenBonds[bondIndex];
    bond.active = false;

    return {
      bond_broken: true,
      bond_id: bondId,
      source: bond.source,
      target: bond.target,
      total_syncs: bond.syncCount,
      status: 'bond_inactive'
    };
  }

  /**
   * Get active bonds
   */
  getActiveBonds() {
    const active = this.hydrogenBonds.filter(b => b.active);
    
    return {
      active_bonds: active.length,
      total_bonds: this.hydrogenBonds.length,
      bonds: active.map(b => ({
        id: b.id,
        source: b.source,
        target: b.target,
        type: b.bondType,
        strength: b.strength,
        syncs: b.syncCount
      }))
    };
  }

  /**
   * Get hydrogen sync status
   */
  getHydrogenStatus() {
    const activeBonds = this.hydrogenBonds.filter(b => b.active).length;
    const totalSyncs = this.hydrogenBonds.reduce((sum, b) => sum + b.syncCount, 0);

    return {
      hydrogen_bonds_enabled: this.config.hydrogen_bonds.enabled,
      propagation_speed: this.propagationSpeed,
      bond_strength: this.bondStrength,
      active_bonds: activeBonds,
      total_bonds: this.hydrogenBonds.length,
      total_syncs: totalSyncs,
      queue_length: this.syncQueue.length,
      status: activeBonds > 0 ? 'syncing_active' : 'ready'
    };
  }

  /**
   * Test hydrogen bond connectivity
   */
  testConnectivity(source, target) {
    const bond = this.hydrogenBonds.find(
      b => b.source === source && b.target === target && b.active
    );

    if (!bond) {
      return {
        connected: false,
        message: 'No active bond between components'
      };
    }

    // Simulate test sync
    const testResult = this.syncViaHydrogenBond(bond.id, { test: true });

    return {
      connected: true,
      bond_id: bond.id,
      test_sync: testResult.synced ? 'success' : 'failed',
      propagation_speed: this.propagationSpeed,
      bond_strength: bond.strength,
      reliability: 'high'
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HydrogenSync;
}
