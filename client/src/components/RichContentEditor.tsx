/**
 * Rich Content Editor Component
 * 
 * Advanced content editor with rich text formatting, media embedding,
 * interactive elements, formula support, and collaborative editing.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Editor, EditorState, RichUtils, ContentState, convertToRaw, convertFromRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { stateFromHTML } from 'draft-js-import-html';
import 'draft-js/dist/Draft.css';
import './RichContentEditor.css';

// Icons (you might want to replace these with actual icon components)
const FormatBoldIcon = () => <span>B</span>;
const FormatItalicIcon = () => <span>I</span>;
const FormatUnderlinedIcon = () => <span>U</span>;
const FormatListBulletedIcon = () => <span>•</span>;
const FormatListNumberedIcon = () => <span>1.</span>;
const LinkIcon = () => <span>🔗</span>;
const ImageIcon = () => <span>🖼️</span>;
const VideoIcon = () => <span>🎥</span>;
const FormulaIcon = () => <span>∑</span>;
const CodeIcon = () => <span>{}</span>;
const TableIcon = () => <span>⊞</span>;
const QuizIcon = () => <span>❓</span>;

interface RichContentEditorProps {
  initialContent?: string;
  onChange?: (content: string, rawContent: any) => void;
  onSave?: (content: string, rawContent: any) => void;
  placeholder?: string;
  readOnly?: boolean;
  contentId?: string;
  enableCollaboration?: boolean;
  allowedBlocks?: string[];
  maxLength?: number;
}

interface ToolbarButton {
  label: string;
  style?: string;
  type?: string;
  icon: React.ComponentType;
  action: () => void;
  isActive?: boolean;
}

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  title: string;
  altText?: string;
}

interface FormulaData {
  latex: string;
  display: string;
}

interface InteractiveElement {
  type: 'quiz' | 'poll' | 'activity' | 'simulation';
  id: string;
  title: string;
  config: any;
}

const RichContentEditor: React.FC<RichContentEditorProps> = ({
  initialContent = '',
  onChange,
  onSave,
  placeholder = 'Start creating amazing educational content...',
  readOnly = false,
  contentId,
  enableCollaboration = false,
  allowedBlocks = ['all'],
  maxLength
}) => {
  // Editor state
  const [editorState, setEditorState] = useState(() => {
    if (initialContent) {
      try {
        const contentState = stateFromHTML(initialContent);
        return EditorState.createWithContent(contentState);
      } catch (error) {
        console.error('Error parsing initial content:', error);
        return EditorState.createEmpty();
      }
    }
    return EditorState.createEmpty();
  });

  // UI state
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showFormulaEditor, setShowFormulaEditor] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [showInteractiveDialog, setShowInteractiveDialog] = useState(false);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Refs
  const editorRef = useRef<Editor>(null);
  const autoSaveTimeout = useRef<NodeJS.Timeout>();

  // Effect for handling content changes
  useEffect(() => {
    const contentState = editorState.getCurrentContent();
    const text = contentState.getPlainText();
    setWordCount(text.length);

    // Auto-save functionality
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }

    autoSaveTimeout.current = setTimeout(() => {
      handleAutoSave();
    }, 2000); // Auto-save after 2 seconds of inactivity

    // Notify parent of changes
    if (onChange) {
      const html = stateToHTML(contentState);
      const raw = convertToRaw(contentState);
      onChange(html, raw);
    }

    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
    };
  }, [editorState, onChange]);

  // Auto-save handler
  const handleAutoSave = useCallback(async () => {
    if (!contentId || readOnly) return;

    try {
      setIsAutoSaving(true);
      const contentState = editorState.getCurrentContent();
      const html = stateToHTML(contentState);
      const raw = convertToRaw(contentState);

      // Call save function if provided
      if (onSave) {
        await onSave(html, raw);
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [editorState, contentId, readOnly, onSave]);

  // Editor change handler
  const handleEditorChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
    setCurrentSelection(newEditorState.getSelection());
  };

  // Format handlers
  const handleBold = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
  };

  const handleItalic = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'ITALIC'));
  };

  const handleUnderline = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'UNDERLINE'));
  };

  const handleBlockType = (blockType: string) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  // Get current inline style
  const getCurrentInlineStyle = () => {
    return editorState.getCurrentInlineStyle();
  };

  // Get current block type
  const getCurrentBlockType = () => {
    const selection = editorState.getSelection();
    return editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
  };

  // Media insertion handlers
  const handleInsertMedia = (mediaItem: MediaItem) => {
    // Implementation for inserting media into editor
    console.log('Inserting media:', mediaItem);
    setShowMediaLibrary(false);
    // Focus back to editor
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleInsertFormula = (formula: FormulaData) => {
    // Implementation for inserting formula into editor
    console.log('Inserting formula:', formula);
    setShowFormulaEditor(false);
    // Focus back to editor
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleInsertLink = (url: string, text: string) => {
    // Implementation for inserting link into editor
    console.log('Inserting link:', { url, text });
    setShowLinkDialog(false);
    // Focus back to editor
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleInsertTable = (rows: number, cols: number) => {
    // Implementation for inserting table into editor
    console.log('Inserting table:', { rows, cols });
    setShowTableDialog(false);
    // Focus back to editor
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleInsertInteractive = (element: InteractiveElement) => {
    // Implementation for inserting interactive element into editor
    console.log('Inserting interactive element:', element);
    setShowInteractiveDialog(false);
    // Focus back to editor
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Manual save handler
  const handleManualSave = () => {
    handleAutoSave();
  };

  // Key command handler
  const handleKeyCommand = (command: string, editorState: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  // Toolbar configuration
  const toolbarButtons: ToolbarButton[] = [
    {
      label: 'Bold',
      style: 'BOLD',
      icon: FormatBoldIcon,
      action: handleBold,
      isActive: getCurrentInlineStyle().has('BOLD')
    },
    {
      label: 'Italic',
      style: 'ITALIC',
      icon: FormatItalicIcon,
      action: handleItalic,
      isActive: getCurrentInlineStyle().has('ITALIC')
    },
    {
      label: 'Underline',
      style: 'UNDERLINE',
      icon: FormatUnderlinedIcon,
      action: handleUnderline,
      isActive: getCurrentInlineStyle().has('UNDERLINE')
    },
    {
      label: 'Bullet List',
      type: 'unordered-list-item',
      icon: FormatListBulletedIcon,
      action: () => handleBlockType('unordered-list-item'),
      isActive: getCurrentBlockType() === 'unordered-list-item'
    },
    {
      label: 'Numbered List',
      type: 'ordered-list-item',
      icon: FormatListNumberedIcon,
      action: () => handleBlockType('ordered-list-item'),
      isActive: getCurrentBlockType() === 'ordered-list-item'
    },
    {
      label: 'Insert Link',
      icon: LinkIcon,
      action: () => setShowLinkDialog(true)
    },
    {
      label: 'Insert Image/Video',
      icon: ImageIcon,
      action: () => setShowMediaLibrary(true)
    },
    {
      label: 'Insert Formula',
      icon: FormulaIcon,
      action: () => setShowFormulaEditor(true)
    },
    {
      label: 'Insert Code',
      type: 'code-block',
      icon: CodeIcon,
      action: () => handleBlockType('code-block'),
      isActive: getCurrentBlockType() === 'code-block'
    },
    {
      label: 'Insert Table',
      icon: TableIcon,
      action: () => setShowTableDialog(true)
    },
    {
      label: 'Insert Interactive',
      icon: QuizIcon,
      action: () => setShowInteractiveDialog(true)
    }
  ];

  // Filter allowed blocks
  const filteredButtons = toolbarButtons.filter(button => 
    allowedBlocks.includes('all') || 
    allowedBlocks.includes(button.style || button.type || button.label.toLowerCase())
  );

  return (
    <div className="rich-content-editor">
      {/* Editor Header */}
      <div className="editor-header">
        <div className="editor-info">
          <span className="word-count">{wordCount} characters</span>
          {maxLength && <span className="max-length">/ {maxLength}</span>}
          {enableCollaboration && (
            <div className="collaborators">
              {collaborators.map(user => (
                <div key={user.id} className="collaborator-avatar">
                  {user.name.charAt(0)}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="editor-actions">
          {isAutoSaving && <span className="auto-saving">Saving...</span>}
          {lastSaved && !isAutoSaving && (
            <span className="last-saved">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button 
            className="save-button"
            onClick={handleManualSave}
            disabled={readOnly}
          >
            Save
          </button>
        </div>
      </div>

      {/* Toolbar */}
      {!readOnly && (
        <div className="editor-toolbar">
          {filteredButtons.map((button, index) => (
            <button
              key={index}
              className={`toolbar-button ${button.isActive ? 'active' : ''}`}
              onClick={button.action}
              title={button.label}
              type="button"
            >
              <button.icon />
            </button>
          ))}
        </div>
      )}

      {/* Editor */}
      <div className="editor-container">
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={handleEditorChange}
          handleKeyCommand={handleKeyCommand}
          placeholder={placeholder}
          readOnly={readOnly}
          spellCheck={true}
        />
      </div>

      {/* Dialogs */}
      {showMediaLibrary && (
        <MediaLibraryDialog
          onSelect={handleInsertMedia}
          onClose={() => setShowMediaLibrary(false)}
        />
      )}

      {showFormulaEditor && (
        <FormulaEditorDialog
          onInsert={handleInsertFormula}
          onClose={() => setShowFormulaEditor(false)}
        />
      )}

      {showLinkDialog && (
        <LinkDialog
          onInsert={handleInsertLink}
          onClose={() => setShowLinkDialog(false)}
        />
      )}

      {showTableDialog && (
        <TableDialog
          onInsert={handleInsertTable}
          onClose={() => setShowTableDialog(false)}
        />
      )}

      {showInteractiveDialog && (
        <InteractiveElementDialog
          onInsert={handleInsertInteractive}
          onClose={() => setShowInteractiveDialog(false)}
        />
      )}
    </div>
  );
};

// Media Library Dialog Component
const MediaLibraryDialog: React.FC<{
  onSelect: (media: MediaItem) => void;
  onClose: () => void;
}> = ({ onSelect, onClose }) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Fetch media items from API
    fetchMediaItems();
  }, [filter, search]);

  const fetchMediaItems = async () => {
    try {
      // Implementation to fetch media from API
      console.log('Fetching media items...');
    } catch (error) {
      console.error('Failed to fetch media:', error);
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog media-library-dialog">
        <div className="dialog-header">
          <h3>Media Library</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="dialog-content">
          <div className="media-filters">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Media</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Documents</option>
            </select>
            <input
              type="text"
              placeholder="Search media..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="media-grid">
            {mediaItems.map(item => (
              <div
                key={item.id}
                className="media-item"
                onClick={() => onSelect(item)}
              >
                <div className="media-preview">
                  {item.type === 'image' && <img src={item.url} alt={item.altText} />}
                  {item.type === 'video' && <video src={item.url} />}
                  {item.type === 'audio' && <div className="audio-icon">🎵</div>}
                  {item.type === 'document' && <div className="doc-icon">📄</div>}
                </div>
                <div className="media-info">
                  <span className="media-title">{item.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Formula Editor Dialog Component
const FormulaEditorDialog: React.FC<{
  onInsert: (formula: FormulaData) => void;
  onClose: () => void;
}> = ({ onInsert, onClose }) => {
  const [latex, setLatex] = useState('');
  const [preview, setPreview] = useState('');

  const handleInsert = () => {
    if (latex.trim()) {
      onInsert({
        latex: latex.trim(),
        display: preview
      });
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog formula-editor-dialog">
        <div className="dialog-header">
          <h3>Formula Editor</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="dialog-content">
          <div className="formula-input">
            <label>LaTeX Formula:</label>
            <textarea
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              placeholder="e.g., x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
              rows={3}
            />
          </div>
          <div className="formula-preview">
            <label>Preview:</label>
            <div className="preview-area">
              {preview || 'Formula preview will appear here'}
            </div>
          </div>
          <div className="dialog-actions">
            <button onClick={onClose}>Cancel</button>
            <button onClick={handleInsert} disabled={!latex.trim()}>
              Insert Formula
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Link Dialog Component
const LinkDialog: React.FC<{
  onInsert: (url: string, text: string) => void;
  onClose: () => void;
}> = ({ onInsert, onClose }) => {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');

  const handleInsert = () => {
    if (url.trim()) {
      onInsert(url.trim(), text.trim() || url.trim());
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog link-dialog">
        <div className="dialog-header">
          <h3>Insert Link</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="dialog-content">
          <div className="input-group">
            <label>URL:</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="input-group">
            <label>Display Text:</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Link text (optional)"
            />
          </div>
          <div className="dialog-actions">
            <button onClick={onClose}>Cancel</button>
            <button onClick={handleInsert} disabled={!url.trim()}>
              Insert Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Table Dialog Component
const TableDialog: React.FC<{
  onInsert: (rows: number, cols: number) => void;
  onClose: () => void;
}> = ({ onInsert, onClose }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  const handleInsert = () => {
    onInsert(rows, cols);
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog table-dialog">
        <div className="dialog-header">
          <h3>Insert Table</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="dialog-content">
          <div className="input-group">
            <label>Rows:</label>
            <input
              type="number"
              value={rows}
              onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max="20"
            />
          </div>
          <div className="input-group">
            <label>Columns:</label>
            <input
              type="number"
              value={cols}
              onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max="10"
            />
          </div>
          <div className="dialog-actions">
            <button onClick={onClose}>Cancel</button>
            <button onClick={handleInsert}>
              Insert Table ({rows}×{cols})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Interactive Element Dialog Component
const InteractiveElementDialog: React.FC<{
  onInsert: (element: InteractiveElement) => void;
  onClose: () => void;
}> = ({ onInsert, onClose }) => {
  const [elementType, setElementType] = useState<InteractiveElement['type']>('quiz');
  const [title, setTitle] = useState('');

  const handleInsert = () => {
    if (title.trim()) {
      onInsert({
        type: elementType,
        id: Date.now().toString(),
        title: title.trim(),
        config: {}
      });
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog interactive-dialog">
        <div className="dialog-header">
          <h3>Insert Interactive Element</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="dialog-content">
          <div className="input-group">
            <label>Type:</label>
            <select
              value={elementType}
              onChange={(e) => setElementType(e.target.value as InteractiveElement['type'])}
            >
              <option value="quiz">Quiz</option>
              <option value="poll">Poll</option>
              <option value="activity">Activity</option>
              <option value="simulation">Simulation</option>
            </select>
          </div>
          <div className="input-group">
            <label>Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter element title"
            />
          </div>
          <div className="dialog-actions">
            <button onClick={onClose}>Cancel</button>
            <button onClick={handleInsert} disabled={!title.trim()}>
              Insert Element
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RichContentEditor;