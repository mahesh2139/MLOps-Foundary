import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Folder, AlertCircle, Loader, ChevronRight, ChevronDown, FileText, FolderOpen, Play, Trash, Save, Code, Lock, Unlock, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { APIClient } from '../services/APIClient';
import { useNotification } from '../hooks/useNotification';
import { Breadcrumb, SearchBar, SkeletonLoader, EmptyState, FilterChip, Pagination } from '../components/UIPatterns';
import { themeClasses } from '../utils/themeClasses';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: 'python' | 'yaml' | 'json' | 'text';
  children?: ProjectFile[];
  expanded?: boolean;
}

interface NotebookCell {
  id: string;
  type: 'code' | 'markdown';
  content: string;
  output?: string;
  executed?: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string;
  environment: 'dev' | 'staging' | 'prod';
  status: 'active' | 'inactive';
  pipelinesCount?: number;
  modelsCount?: number;
  owner?: string;
  createdAt?: string;
  githubRepo?: string;
  locked?: boolean;
  githubBranch?: string;
  lastSyncTime?: string;
  lastSyncStatus?: 'success' | 'failed' | 'pending';
}

export default function Projects() {
  const { theme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'workspace'>('list');
  const [formData, setFormData] = useState<{ 
    name: string; 
    description: string; 
    environment: 'dev' | 'staging' | 'prod'; 
    githubRepo: string;
    githubBranch: string;
  }>({ 
    name: '', 
    description: '', 
    environment: 'dev', 
    githubRepo: '',
    githubBranch: 'main',
  });
  const { showNotification } = useNotification();

  const [fileTree, setFileTree] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [notebookCells, setNotebookCells] = useState<NotebookCell[]>([]);
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<'code' | 'notebook'>('code'); // Code or notebook view
  const [fileType, setFileType] = useState<'python' | 'text' | 'notebook'>('python');

  // Search, Filter, Pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [envFilter, setEnvFilter] = useState<'all' | 'dev' | 'staging' | 'prod'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Precompute filtered and paginated projects for list view (avoids IIFE inside JSX)
  const filtered = projects.filter(p => {
    const matchesSearch = searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesEnv = envFilter === 'all' || p.environment === envFilter;
    return matchesSearch && matchesStatus && matchesEnv;
  });

  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedProjects = filtered.slice(startIdx, endIdx);
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await APIClient.apiGet('/projects');
      const data = Array.isArray(res) ? res : res.data || [];
      setProjects(data);
    } catch (err) {
      console.warn('Failed to load projects, showing empty list:', err);
      // Don't crash - just show empty list
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      showNotification('Project name is required', 'warning');
      return;
    }

    try {
      await APIClient.apiPost('/projects', formData);
      showNotification('Project created successfully', 'success');
      setShowModal(false);
      setFormData({ name: '', description: '', environment: 'dev' as const, githubRepo: '', githubBranch: 'main' });
      await loadProjects();
    } catch (err) {
      console.warn('Failed to create project:', err);
      // Add project locally on error
      const newProject: Project = {
        id: Date.now().toString(),
        ...formData,
        status: 'active'
      };
      setProjects([...projects, newProject]);
      setShowModal(false);
      setFormData({ name: '', description: '', environment: 'dev' as const, githubRepo: '', githubBranch: 'main' });
      showNotification('Project created locally', 'info');
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !formData.name.trim()) {
      showNotification('Project name is required', 'warning');
      return;
    }

    try {
      await APIClient.apiPut(`/projects/${editingId}`, formData);
      showNotification('Project updated successfully', 'success');
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', description: '', environment: 'dev' as const, githubRepo: '', githubBranch: 'main' });
      await loadProjects();
    } catch (err) {
      console.warn('Failed to update project:', err);
      // Update project locally on error
      setProjects(projects.map(p => p.id === editingId ? { ...p, ...formData } : p));
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', description: '', environment: 'dev' as const, githubRepo: '', githubBranch: 'main' });
      showNotification('Project updated locally', 'info');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await APIClient.apiDelete(`/projects/${id}`);
      showNotification('Project deleted successfully', 'success');
      await loadProjects();
    } catch (err) {
      console.warn('Failed to delete project:', err);
      // Delete project locally on error
      setProjects(projects.filter(p => p.id !== id));
      showNotification('Project deleted locally', 'info');
    }
  };

  const openEditModal = (project: Project) => {
    setEditingId(project.id);
    setFormData({
      name: project.name,
      description: project.description || '',
      environment: project.environment,
      githubRepo: project.githubRepo || '',
      githubBranch: project.githubBranch || 'main',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', description: '', environment: 'dev' as const, githubRepo: '', githubBranch: 'main' });
  };

  const initializeWorkspace = (project: Project) => {
    setSelectedProject(project);
    setFileTree([
      {
        id: '1',
        name: 'src',
        type: 'folder',
        expanded: true,
        children: [
          { id: '1-1', name: 'train.py', type: 'file', language: 'python', content: '# Training script\nimport sys\nprint("Training model...")' },
          { id: '1-2', name: 'inference.py', type: 'file', language: 'python', content: '# Inference script\nimport sys\nprint("Running inference...")' },
        ],
      },
      { id: '2', name: 'config.yaml', type: 'file', language: 'yaml', content: 'model:\n  name: ml-model\n  version: 1.0' },
      { id: '3', name: 'requirements.txt', type: 'file', language: 'text', content: 'scikit-learn==1.0.0\npandas==1.3.0\nnumpy==1.21.0' },
    ]);
    setSelectedFile(null);
    setNotebookCells([
      { id: 'cell-1', type: 'markdown', content: '# ML Project Notebook' },
      { id: 'cell-2', type: 'code', content: 'import pandas as pd\ndf = pd.read_csv("data.csv")\nprint(df.head())' },
    ]);
    setViewMode('workspace');
  };

  const toggleFileExpand = (fileId: string) => {
    const toggleInTree = (files: ProjectFile[]): ProjectFile[] => {
      return files.map(file => 
        file.id === fileId 
          ? { ...file, expanded: !file.expanded }
          : file.children ? { ...file, children: toggleInTree(file.children) } : file
      );
    };
    setFileTree(toggleInTree(fileTree));
  };

  const handleFileSelect = (file: ProjectFile) => {
    if (file.type === 'file') {
      setSelectedFile(file);
    }
  };

  const handleExecuteCell = (cellId: string) => {
    setNotebookCells(cells =>
      cells.map(cell =>
        cell.id === cellId
          ? { ...cell, executed: true, output: `Output: ${cell.content.split('\n').pop()}` }
          : cell
      )
    );
    showNotification('Cell executed', 'success');
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      showNotification('File name is required', 'error');
      return;
    }
    
    // Auto-add extension based on file type
    let filename = newFileName;
    if (fileType === 'python' && !filename.endsWith('.py')) filename += '.py';
    if (fileType === 'text' && !filename.endsWith('.txt')) filename += '.txt';
    if (fileType === 'notebook' && !filename.endsWith('.ipynb')) filename += '.ipynb';

    const newFile: ProjectFile = {
      id: Date.now().toString(),
      name: filename,
      type: 'file',
      language: fileType === 'notebook' ? 'python' : fileType === 'python' ? 'python' : 'text',
      content: '',
    };

    if (selectedFolderId) {
      // Add to folder
      const addToFolder = (files: ProjectFile[]): ProjectFile[] => {
        return files.map(f =>
          f.id === selectedFolderId && f.type === 'folder'
            ? { ...f, children: [...(f.children || []), newFile] }
            : f.children ? { ...f, children: addToFolder(f.children) } : f
        );
      };
      setFileTree(addToFolder(fileTree));
    } else {
      setFileTree([...fileTree, newFile]);
    }

    setNewFileName('');
    setFileType('python');
    setShowNewFileModal(false);
    setSelectedFolderId(null);
    showNotification('File created', 'success');
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      showNotification('Folder name is required', 'error');
      return;
    }

    const newFolder: ProjectFile = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      type: 'folder',
      children: [],
      expanded: false,
    };

    if (selectedFolderId) {
      const addToFolder = (files: ProjectFile[]): ProjectFile[] => {
        return files.map(f =>
          f.id === selectedFolderId && f.type === 'folder'
            ? { ...f, children: [...(f.children || []), newFolder] }
            : f.children ? { ...f, children: addToFolder(f.children) } : f
        );
      };
      setFileTree(addToFolder(fileTree));
    } else {
      setFileTree([...fileTree, newFolder]);
    }

    setNewFolderName('');
    setShowNewFolderModal(false);
    setSelectedFolderId(null);
    showNotification('Folder created', 'success');
  };

  // Convert notebook cells to Python code
  const notebookToPython = (): string => {
    const lines: string[] = [];
    notebookCells.forEach((cell) => {
      if (cell.type === 'markdown') {
        lines.push('# ' + cell.content.split('\n')[0]);
      } else {
        lines.push(cell.content);
      }
      lines.push('');
    });
    return lines.join('\n');
  };

  // Save notebook and convert to .py
  const handleSaveNotebook = () => {
    if (selectedFile && editorMode === 'notebook') {
      // Option 1: Save as .ipynb (proper notebook format)
      const notebookFormat = {
        cells: notebookCells.map(cell => ({
          cell_type: cell.type,
          metadata: {},
          source: cell.content.split('\n'),
          outputs: cell.output ? [{ output_type: 'stream', text: cell.output.split('\n') }] : [],
          execution_count: cell.executed ? 1 : null,
        })),
        metadata: {
          kernelspec: { display_name: 'Python 3', language: 'python', name: 'python3' },
          language_info: { name: 'python', version: '3.8.0' },
        },
        nbformat: 4,
        nbformat_minor: 4,
      };

      // Save as .ipynb file
      const updateFileIpynb = (files: ProjectFile[]): ProjectFile[] => {
        return files.map(f =>
          f.id === selectedFile.id
            ? { ...f, content: JSON.stringify(notebookFormat, null, 2), language: 'python' }
            : f.children ? { ...f, children: updateFileIpynb(f.children) } : f
        );
      };
      
      setFileTree(updateFileIpynb(fileTree));
      setSelectedFile({ ...selectedFile, content: JSON.stringify(notebookFormat, null, 2) });
      showNotification('Notebook saved as .ipynb', 'success');
    }
  };

  // Also support saving as .py
  const handleSaveNotebookAsPy = () => {
    if (selectedFile) {
      const pythonCode = notebookToPython();
      const pyFilename = selectedFile.name.replace('.ipynb', '.py');
      
      const updateFile = (files: ProjectFile[]): ProjectFile[] => {
        return files.map(f =>
          f.id === selectedFile.id
            ? { ...f, name: pyFilename, content: pythonCode, language: 'python' }
            : f.children ? { ...f, children: updateFile(f.children) } : f
        );
      };
      
      setFileTree(updateFile(fileTree));
      setSelectedFile({ ...selectedFile, name: pyFilename, content: pythonCode });
      showNotification('Notebook saved as .py file', 'success');
    }
  };

  const handleUpdateFileContent = (content: string) => {
    if (selectedFile) {
      const updateInTree = (files: ProjectFile[]): ProjectFile[] => {
        return files.map(file =>
          file.id === selectedFile.id
            ? { ...file, content }
            : file.children ? { ...file, children: updateInTree(file.children) } : file
        );
      };
      setFileTree(updateInTree(fileTree));
      setSelectedFile({ ...selectedFile, content });
      showNotification('File saved', 'success');
    }
  };

  const renderFileTree = (files: ProjectFile[], depth = 0): React.ReactNode => {
    return files.map(file => (
      <div key={file.id}>
        <div
          onClick={() => {
            if (file.type === 'folder') {
              toggleFileExpand(file.id);
            } else {
              handleFileSelect(file);
              // Auto-detect editor mode based on file type
              if (file.name.endsWith('.ipynb')) {
                setEditorMode('notebook');
              } else {
                setEditorMode('code');
              }
            }
          }}
          className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-700 group ${
            selectedFile?.id === file.id ? 'bg-blue-600/30 border-l-2 border-blue-400' : ''
          }`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {file.type === 'folder' && (
            file.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          )}
          {file.type === 'folder' ? <FolderOpen className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
          <span className="text-sm flex-1">{file.name}</span>
          {file.type === 'folder' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFolderId(file.id);
                setShowNewFileModal(true);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded transition-opacity"
              title="Add file"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>
        {file.type === 'folder' && file.expanded && file.children && renderFileTree(file.children, depth + 1)}
      </div>
    ));
  };

  // Project lock removed - no longer needed

  const syncProjectWithGitHub = (projectId: string) => {
    setProjects(projects.map(p =>
      p.id === projectId
        ? { ...p, lastSyncStatus: 'pending', lastSyncTime: 'just now' }
        : p
    ));
    setTimeout(() => {
      setProjects(prev =>
        prev.map(p =>
          p.id === projectId
            ? { ...p, lastSyncStatus: 'success', lastSyncTime: 'just now' }
            : p
        )
      );
      showNotification('Project synced with GitHub successfully', 'success');
    }, 1500);
  };

  const getEnvColor = (env: string) => {
    return env === 'prod' ? 'from-red-600/20 to-red-400/10 border-red-400/30' :
           env === 'staging' ? 'from-yellow-600/20 to-yellow-400/10 border-yellow-400/30' :
           'from-blue-600/20 to-blue-400/10 border-blue-400/30';
  };

  const getEnvTextColor = (env: string) => {
    return env === 'prod' ? 'text-red-400' :
           env === 'staging' ? 'text-yellow-400' :
           'text-blue-400';
  };

  return (
    <div className="space-y-8">
      {/* Workspace View */}
      {viewMode === 'workspace' && selectedProject && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{selectedProject.name} Workspace</h1>
              <p className="text-white/60 mt-1">Environment: {selectedProject.environment}</p>
            </div>
            <button
              onClick={() => setViewMode('list')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
            >
              Back to Projects
            </button>
          </div>

          {/* Workspace Layout */}
          <div className="grid grid-cols-4 gap-4 h-96">
            {/* File Tree - Left */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden flex flex-col">
              <div className="p-3 border-b border-gray-700 flex items-center justify-between bg-gray-900">
                <h3 className="font-semibold text-sm">Files</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setSelectedFolderId(null);
                      setShowNewFileModal(true);
                    }}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title="New file"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFolderId(null);
                      setShowNewFolderModal(true);
                    }}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title="New folder"
                  >
                    <FolderOpen className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto text-sm">
                {renderFileTree(fileTree)}
              </div>
            </div>

            {/* Editor - Center (takes 2 columns) */}
            <div className="col-span-2 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden flex flex-col">
              {selectedFile ? (
                <>
                  <div className="p-3 border-b border-gray-700 bg-gray-900 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="font-semibold text-sm">{selectedFile.name}</span>
                      {selectedFile.name.endsWith('.ipynb') && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditorMode('notebook')}
                            className={`px-2 py-1 text-xs rounded ${editorMode === 'notebook' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                          >
                            Notebook
                          </button>
                          <button
                            onClick={() => setEditorMode('code')}
                            className={`px-2 py-1 text-xs rounded ${editorMode === 'code' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                          >
                            Code
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateFileContent(selectedFile.content || '')}
                        className="p-1 hover:bg-gray-700 rounded flex items-center gap-1 text-xs transition-colors"
                        title="Save file"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      {selectedFile.name.endsWith('.ipynb') && editorMode === 'notebook' && (
                        <>
                          <button
                            onClick={handleSaveNotebook}
                            className="px-2 py-1 hover:bg-blue-700 rounded flex items-center gap-1 text-xs bg-blue-600 transition-colors"
                            title="Save .ipynb notebook"
                          >
                            Save Notebook
                          </button>
                          <button
                            onClick={handleSaveNotebookAsPy}
                            className="px-2 py-1 hover:bg-purple-700 rounded flex items-center gap-1 text-xs bg-purple-600 transition-colors"
                            title="Export as .py"
                          >
                            Export as .py
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Code Editor */}
                  {editorMode === 'code' || !selectedFile.name.endsWith('.ipynb') ? (
                    <textarea
                      value={selectedFile.content || ''}
                      onChange={(e) => setSelectedFile({ ...selectedFile, content: e.target.value })}
                      className="flex-1 bg-gray-900 text-gray-300 p-3 focus:outline-none font-mono text-sm"
                      spellCheck="false"
                    />
                  ) : (
                    /* Notebook Editor */
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {notebookCells.map((cell, idx) => (
                        <div key={cell.id} className="bg-gray-900 border border-gray-700 rounded p-2 space-y-1">
                          <div className="flex items-center justify-between">
                            <select
                              value={cell.type}
                              onChange={(e) => {
                                const newCells = [...notebookCells];
                                newCells[idx].type = e.target.value as 'code' | 'markdown';
                                setNotebookCells(newCells);
                              }}
                              className="text-xs px-2 py-1 bg-gray-800 border border-gray-700 rounded"
                            >
                              <option value="markdown">Markdown</option>
                              <option value="code">Code</option>
                            </select>
                            <button
                              onClick={() => {
                                const newCells = notebookCells.filter((_, i) => i !== idx);
                                setNotebookCells(newCells);
                              }}
                              className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded"
                            >
                              Delete
                            </button>
                          </div>
                          <textarea
                            value={cell.content}
                            onChange={(e) => {
                              const newCells = [...notebookCells];
                              newCells[idx].content = e.target.value;
                              setNotebookCells(newCells);
                            }}
                            className="w-full bg-gray-800 text-gray-300 p-2 rounded font-mono text-sm outline-none border border-gray-700"
                            rows={3}
                          />
                          {cell.executed && cell.output && (
                            <div className="text-xs text-green-400 bg-gray-800 p-2 rounded">
                              Output: {cell.output}
                            </div>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setNotebookCells([
                            ...notebookCells,
                            { id: `cell-${Date.now()}`, type: 'code', content: '', executed: false },
                          ]);
                        }}
                        className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                      >
                        + Add Cell
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select a file to edit
                </div>
              )}
            </div>

            {/* Metadata - Right */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden flex flex-col">
              <div className="p-3 border-b border-gray-700 bg-gray-900 font-semibold text-sm">
                Metadata
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Created</p>
                  <p className="text-white mt-1">{selectedProject.createdAt || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Environment</p>
                  <p className="text-white mt-1 capitalize">{selectedProject.environment}</p>
                </div>
                {selectedFile && (
                  <>
                    <div>
                      <p className="text-gray-500 text-xs">File Type</p>
                      <p className="text-white mt-1">{selectedFile.language}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Size</p>
                      <p className="text-white mt-1">{selectedFile.content?.length || 0} bytes</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notebook Cells */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-white">Notebook Cells</h3>
            {notebookCells.map((cell) => (
              <div key={cell.id} className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-gray-700 rounded">
                    {cell.type === 'code' ? '[ ]' : 'Markdown'}
                  </span>
                  {cell.type === 'code' && (
                    <button
                      onClick={() => handleExecuteCell(cell.id)}
                      className="p-1 hover:bg-gray-700 rounded flex items-center gap-1 text-xs text-blue-400"
                    >
                      <Play className="w-3 h-3" />
                      Run
                    </button>
                  )}
                </div>
                <pre className="text-sm text-gray-300 bg-gray-800 p-2 rounded overflow-x-auto">
                  {cell.content}
                </pre>
                {cell.executed && cell.output && (
                  <div className="text-xs text-green-400 bg-gray-800 p-2 rounded">
                    {cell.output}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Breadcrumb */}
          <Breadcrumb items={[{ label: 'Projects' }]} />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Projects</h1>
              <p className="text-white/60">Manage your ML projects and environments</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowModal(true);
                }
              }}
            >
              <Plus size={20} />
              New Project
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-400 font-medium">Error Loading Projects</p>
                <p className="text-red-300/80 text-sm mt-1">{error}</p>
                <button
                  onClick={loadProjects}
                  className="mt-2 text-red-300 hover:text-red-200 text-sm font-medium underline"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      loadProjects();
                    }
                  }}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <>
              <SkeletonLoader count={6} variant="card" />
            </>
          )}

          {/* Search and Filters */}
          {!loading && projects.length > 0 && (
            <div className="space-y-4">
              <SearchBar
                placeholder="Search projects by name, description..."
                onSearch={setSearchQuery}
              />

              <div className="flex gap-2 flex-wrap">
                <FilterChip
                  label="All"
                  isActive={statusFilter === 'all'}
                  onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
                />
                <FilterChip
                  label="Active"
                  isActive={statusFilter === 'active'}
                  onClick={() => { setStatusFilter('active'); setCurrentPage(1); }}
                />
                <FilterChip
                  label="Inactive"
                  isActive={statusFilter === 'inactive'}
                  onClick={() => { setStatusFilter('inactive'); setCurrentPage(1); }}
                />
                <div className="border-l border-white/10"></div>
                <FilterChip
                  label="Dev"
                  isActive={envFilter === 'dev'}
                  onClick={() => { setEnvFilter('dev'); setCurrentPage(1); }}
                />
                <FilterChip
                  label="Staging"
                  isActive={envFilter === 'staging'}
                  onClick={() => { setEnvFilter('staging'); setCurrentPage(1); }}
                />
                <FilterChip
                  label="Prod"
                  isActive={envFilter === 'prod'}
                  onClick={() => { setEnvFilter('prod'); setCurrentPage(1); }}
                />
              </div>
            </div>
          )}

          {/* Projects Grid */}
          {!loading && projects.length === 0 && (
            <EmptyState
              icon={<Folder size={48} />}
              title="No projects found"
              description="Create your first ML project to get started"
              action={{
                label: 'Create Project',
                onClick: () => setShowModal(true),
              }}
            />
          )}

          {!loading && projects.length > 0 && filtered.length === 0 && (
            <EmptyState
              title="No projects match your filters"
              description="Try adjusting your search or filter criteria"
              action={{
                label: 'Clear Filters',
                onClick: () => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setEnvFilter('all');
                  setCurrentPage(1);
                },
              }}
            />
          )}

          {!loading && filtered.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProjects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-6 bg-gradient-to-br ${getEnvColor(project.environment)} rounded-xl border transition-all hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        initializeWorkspace(project);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white mb-1">{project.name}</h3>
                          {project.locked && (
                            <Lock className="w-4 h-4 text-red-400" aria-label="Project locked" />
                          )}
                        </div>
                        <p className="text-white/60 text-sm">{project.description || 'No description'}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => initializeWorkspace(project)}
                          className="p-2 hover:bg-blue-500/20 rounded-lg transition-all text-blue-400 hover:text-blue-300"
                          title="Open workspace"
                        >
                          <Code size={16} />
                        </button>
                        {project.githubRepo && (
                          <button
                            onClick={() => syncProjectWithGitHub(project.id)}
                            className="p-2 hover:bg-green-500/20 rounded-lg transition-all text-green-400 hover:text-green-300"
                            title="Sync with GitHub"
                          >
                            <RefreshCw size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(project)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/70 hover:text-white"
                          title="Edit project"
                        >
                          <Edit2 size={16} />
                        </button>
                        {!project.locked && (
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-all text-white/70 hover:text-red-400"
                            title="Delete project"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Environment Badge */}
                    <div className="mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getEnvTextColor(project.environment)} bg-white/10 border border-white/20`}>
                        {project.environment.toUpperCase()}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/20">
                      <div>
                        <p className="text-white/60 text-xs font-medium">PIPELINES</p>
                        <p className="text-2xl font-bold text-white mt-1">{project.pipelinesCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs font-medium">MODELS</p>
                        <p className="text-2xl font-bold text-white mt-1">{project.modelsCount || 0}</p>
                      </div>
                    </div>

                    {/* GitHub Link */}
                    {project.githubRepo && (
                      <div className="mt-4 space-y-2">
                        <a
                          href={`https://github.com/${project.githubRepo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        >
                          <ExternalLink size={14} />
                          {project.githubRepo}
                        </a>
                        <div className="text-xs text-gray-400 space-y-1">
                          <div>Branch: <span className="text-gray-300 font-mono">{project.githubBranch || 'main'}</span></div>
                          <div className="flex items-center gap-2">
                            Last sync: <span className="text-gray-300">{project.lastSyncTime || 'Never'}</span>
                            {project.lastSyncStatus && (
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                project.lastSyncStatus === 'success' ? 'bg-green-600/20 text-green-400' :
                                project.lastSyncStatus === 'failed' ? 'bg-red-600/20 text-red-400' :
                                'bg-yellow-600/20 text-yellow-400'
                              }`}>
                                {project.lastSyncStatus}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filtered.length}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 w-full max-w-md border border-white/20 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingId ? 'Edit Project' : 'Create New Project'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Project Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:border-blue-400 focus:outline-none transition-colors"
                  placeholder="e.g., ML Model Deployment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:border-blue-400 focus:outline-none transition-colors resize-none"
                  placeholder="Describe this project"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Environment</label>
                <select
                  value={formData.environment}
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value as 'dev' | 'staging' | 'prod' })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-blue-400 focus:outline-none transition-colors"
                >
                  <option value="dev" className="bg-slate-800">Development</option>
                  <option value="staging" className="bg-slate-800">Staging</option>
                  <option value="prod" className="bg-slate-800">Production</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">GitHub Repository</label>
                <input
                  type="text"
                  value={formData.githubRepo}
                  onChange={(e) => setFormData({ ...formData, githubRepo: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:border-blue-400 focus:outline-none transition-colors"
                  placeholder="e.g., org/ml-models"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">GitHub Branch</label>
                <input
                  type="text"
                  value={formData.githubBranch}
                  onChange={(e) => setFormData({ ...formData, githubBranch: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:border-blue-400 focus:outline-none transition-colors"
                  placeholder="e.g., main"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={editingId ? handleUpdate : handleCreate}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all font-medium"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Create New File</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">File Type</label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value as 'python' | 'text' | 'notebook')}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="python">Python (.py)</option>
                  <option value="notebook">Jupyter Notebook (.ipynb)</option>
                  <option value="text">Text File (.txt)</option>
                </select>
              </div>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="File name (without extension)"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowNewFileModal(false);
                    setNewFileName('');
                    setSelectedFolderId(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFile}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Create New Folder</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowNewFolderModal(false);
                    setNewFolderName('');
                    setSelectedFolderId(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
