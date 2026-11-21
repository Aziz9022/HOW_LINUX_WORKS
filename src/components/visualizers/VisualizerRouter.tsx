import React from 'react';
import { VisualizerId } from '../../data/types';
import { ArchitectureForkVisualizer } from './ArchitectureForkVisualizer';
import { PermissionsFhsVisualizer } from './PermissionsFhsVisualizer';
import { StorageLvmInodeVisualizer } from './StorageLvmInodeVisualizer';
import { BootSystemdVisualizer } from './BootSystemdVisualizer';
import { ConfigCronPamVisualizer } from './ConfigCronPamVisualizer';
import { MemoryCgroupsVisualizer } from './MemoryCgroupsVisualizer';
import { NetworkIptablesVisualizer } from './NetworkIptablesVisualizer';
import { ToolingVisualizers } from './ToolingVisualizers';

export const VisualizerRouter: React.FC<{ visualizerId: VisualizerId }> = ({ visualizerId }) => {
  switch (visualizerId) {
    case 'architecture_fork':
      return <ArchitectureForkVisualizer />;
    case 'permissions_fhs':
      return <PermissionsFhsVisualizer />;
    case 'scsi_storage':
      return <StorageLvmInodeVisualizer mode="scsi" />;
    case 'lvm_inodes':
      return <StorageLvmInodeVisualizer mode="lvm_inodes" />;
    case 'boot_grub':
      return <BootSystemdVisualizer mode="boot" />;
    case 'systemd_timeline':
      return <BootSystemdVisualizer mode="systemd" />;
    case 'config_cron_pam':
      return <ConfigCronPamVisualizer />;
    case 'memory_cgroups':
      return <MemoryCgroupsVisualizer />;
    case 'network_iptables':
      return <NetworkIptablesVisualizer mode="network_iptables" />;
    case 'socket_accept_fork':
      return <NetworkIptablesVisualizer mode="socket_accept_fork" />;
    case 'shell_quoting':
      return <ToolingVisualizers mode="shell_quoting" />;
    case 'rsync_slash':
      return <ToolingVisualizers mode="rsync_slash" />;
    case 'make_graph':
      return <ToolingVisualizers mode="make_graph" />;
    case 'docker_netns_overlay':
      return <ToolingVisualizers mode="docker_netns_overlay" />;
    default:
      return null;
  }
};
