import React, { useEffect, useState } from 'react';
import { Folder, File, ChevronLeft, HardDrive, Database } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface DiskNode {
  name: string;
  path: string;
  size: number;
  is_dir: boolean;
  children: DiskNode[] | null;
}

export const StorageAnalyzer: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('C:\\');
  const [currentNode, setCurrentNode] = useState<DiskNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiskUsage = async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const node: DiskNode = await invoke('get_disk_usage', { path, depth: 1 });
      setCurrentNode(node);
    } catch (e) {
      setError(e as string);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiskUsage(currentPath);
  }, [currentPath]);

  const navigateUp = () => {
    const pathParts = currentPath.split('\\');
    if (pathParts.length <= 2) return; // Already at root (e.g., "C:\")

    pathParts.pop();
    if (pathParts[pathParts.length - 1] === '') pathParts.pop();

    const newPath = pathParts.join('\\') + '\\';
    setCurrentPath(newPath);
  };

  const navigateTo = (node: DiskNode) => {
    if (node.is_dir) {
      setCurrentPath(node.path);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400 p-6">
        <Database className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">{error}</p>
        <button
          onClick={() => setCurrentPath('C:\\')}
          className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
        >
          Back to Root
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={navigateUp}
            disabled={currentPath === 'C:\\'}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-blue-500" />
              Storage Analyzer
            </h2>
            <p className="text-sm text-zinc-500 font-mono">{currentPath}</p>
          </div>
        </div>

        {currentNode && (
          <div className="text-right">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Folder Size</p>
            <p className="text-lg font-mono text-white">{formatBytes(currentNode.size)}</p>
          </div>
        )}
      </div>

      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
        <div className="grid grid-cols-4 gap-2 p-3 bg-zinc-800/50 border-b border-zinc-800 text-xs font-medium text-zinc-400 uppercase tracking-wider">
          <div className="col-span-2">Name</div>
          <div>Size</div>
          <div className="text-right">Type</div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full text-zinc-500 animate-pulse">
              Scanning directory...
            </div>
          ) : currentNode?.children ? (
            <div className="divide-y divide-zinc-800">
              {currentNode.children.length === 0 ? (
                <div className="flex items-center justify-center h-full py-20 text-zinc-500">
                  <p>This folder is empty</p>
                </div>
              ) : (
                currentNode.children.map((node, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigateTo(node)}
                    disabled={!node.is_dir}
                    className={`w-full flex items-center justify-between p-3 text-sm transition-colors ${
                      node.is_dir
                        ? 'text-zinc-200 hover:bg-zinc-800/50 cursor-pointer'
                        : 'text-zinc-400 cursor-default'
                    }`}
                  >
                    <div className="flex items-center gap-3 col-span-2">
                      {node.is_dir ? (
                        <Folder className="w-4 h-4 text-blue-400" />
                      ) : (
                        <File className="w-4 h-4 text-zinc-500" />
                      )}
                      <span className="truncate max-w-md">{node.name}</span>
                    </div>
                    <div className="text-zinc-400 font-mono w-24 text-right">
                      {node.is_dir ? '--' : formatBytes(node.size)}
                    </div>
                    <div className="text-right text-zinc-500 w-20">
                      {node.is_dir ? 'Folder' : 'File'}
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full py-20 text-zinc-500">
              <p>No data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
