import React, { useState } from 'react';
import { Plus, Lock, Unlock, Play, Save } from 'lucide-react';

const PipelineDAG: React.FC = () => {
  const [nodes, setNodes] = useState([
    { id: '1', name: 'Data Ingestion', type: 'input', locked: false, x: 50, y: 200 },
    { id: '2', name: 'Data Preparation', type: 'process', locked: false, x: 250, y: 200 },
    { id: '3', name: 'Feature Store', type: 'process', locked: false, x: 450, y: 200 },
    { id: '4', name: 'Model Registry', type: 'process', locked: true, x: 650, y: 200 },
    { id: '5', name: 'Model Deployment', type: 'process', locked: false, x: 850, y: 200 },
    { id: '6', name: 'Model Inference', type: 'process', locked: false, x: 1050, y: 200 },
    { id: '7', name: 'Model Monitoring', type: 'monitor', locked: false, x: 1250, y: 200 },
    { id: '8', name: 'CI/CD Enforcement', type: 'output', locked: true, x: 1450, y: 200 },
  ]);

  const toggleLock = (nodeId: string) => {
    setNodes(nodes.map(n => 
      n.id === nodeId ? { ...n, locked: !n.locked } : n
    ));
  };

  const getNodeColor = (type: string, locked: boolean) => {
    if (locked) return 'bg-red-600/20 border-red-500';
    const colors: Record<string, string> = {
      input: 'bg-blue-600/20 border-blue-500',
      process: 'bg-green-600/20 border-green-500',
      monitor: 'bg-yellow-600/20 border-yellow-500',
      output: 'bg-purple-600/20 border-purple-500',
    };
    return colors[type] || 'bg-gray-600/20 border-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pipeline DAG Builder</h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition">
            <Save className="w-4 h-4" />
            Save
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition">
            <Play className="w-4 h-4" />
            Run Pipeline
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 overflow-x-auto" style={{ minHeight: '500px' }}>
        <div className="relative inline-block" style={{ minWidth: '1600px', minHeight: '400px' }}>
          {/* Connection Lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ top: 0, left: 0 }}
          >
            {nodes.slice(0, -1).map((node, idx) => {
              const nextNode = nodes[idx + 1];
              return (
                <line
                  key={`line-${node.id}`}
                  x1={node.x + 80}
                  y1={node.y + 40}
                  x2={nextNode.x}
                  y2={nextNode.y + 40}
                  stroke="#4b5563"
                  strokeWidth="2"
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute flex flex-col items-center justify-center w-32 h-20 border-2 rounded-lg transition cursor-pointer hover:shadow-lg ${getNodeColor(node.type, node.locked)}`}
              style={{ left: `${node.x}px`, top: `${node.y}px` }}
            >
              <div className="text-center px-2">
                <p className="text-sm font-semibold">{node.name}</p>
                <p className="text-xs text-gray-400 capitalize">{node.type}</p>
              </div>
              {node.locked && (
                <button
                  onClick={() => toggleLock(node.id)}
                  className="absolute bottom-1 right-1 p-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                  title="Click to unlock"
                >
                  <Lock className="w-3 h-3" />
                </button>
              )}
              {!node.locked && (
                <button
                  onClick={() => toggleLock(node.id)}
                  className="absolute bottom-1 right-1 p-1 bg-gray-600 hover:bg-gray-500 rounded text-xs"
                  title="Click to lock"
                >
                  <Unlock className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Node Details */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Locked Nodes (CI/CD Enforcement)</h3>
        <div className="space-y-2">
          {nodes.filter(n => n.locked).map(node => (
            <div key={node.id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded border-l-4 border-red-500">
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-red-500" />
                <div>
                  <p className="font-medium">{node.name}</p>
                  <p className="text-xs text-gray-400">Changes require GitHub PR + approval</p>
                </div>
              </div>
              <button
                onClick={() => toggleLock(node.id)}
                className="text-xs bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded transition"
              >
                Unlock
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Pipeline Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Pipeline Name</label>
            <input
              type="text"
              defaultValue="Canonical Pipeline v1"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">GitHub Path</label>
            <input
              type="text"
              defaultValue="pipelines/project-1/canonical-pipeline.json"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Version</label>
            <input
              type="text"
              defaultValue="1.0.0"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100">
              <option>draft</option>
              <option>validated</option>
              <option>active</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineDAG;
