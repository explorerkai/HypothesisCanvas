import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import api from '../services/api';
import jsPDF from 'jspdf';

const CANVAS_ITEMS = [
  { id: 'purpose', title: '目的', placeholder: 'われわれはなぜこの事業をやるのか？' },
  { id: 'vision', title: 'ビジョン', placeholder: '中長期的に顧客にどういう状況になってもらいたいか？' },
  { id: 'problems', title: '顕在課題／潜在課題', placeholder: '顧客が気づいている課題と気づけていない課題' },
  { id: 'alternatives', title: '代替手段', placeholder: '課題を解決するために顧客が現状取っている手段' },
  { id: 'situation', title: '状況／傾向', placeholder: 'どのような状況にある顧客が対象なのか' },
  { id: 'value', title: '提案価値', placeholder: 'われわれは顧客をどんな解決状態にするのか？' },
  { id: 'means', title: '実現手段', placeholder: '提案価値を実現するのに必要な手段' },
  { id: 'advantage', title: '優位性', placeholder: '提案価値や実現手段の提供に貢献するリソース' },
  { id: 'channel', title: 'チャネル', placeholder: '状況にあげた人たちに出会うための手段' },
  { id: 'metrics', title: '評価指標', placeholder: 'どうなればこの事業が進捗していると判断できるのか？' },
  { id: 'revenue', title: '収益モデル', placeholder: 'どうやって儲けるのか？' },
  { id: 'market', title: '市場規模', placeholder: '対象となる市場の規模感は？' }
];

function Canvas({ canvas, userName, onBack }) {
  const [items, setItems] = useState({});
  const [activeUsers, setActiveUsers] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const syncIntervalRef = useRef(null);
  const lastSyncRef = useRef(Date.now());

  useEffect(() => {
    loadCanvasData();
    startSync();
    createSession();

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [canvas.id]);

  const loadCanvasData = async () => {
    try {
      const response = await api.getCanvas(canvas.id);
      const canvasItems = response.data.items || [];
      const itemsMap = {};

      CANVAS_ITEMS.forEach(item => {
        const existingItem = canvasItems.find(ci => ci.item_type === item.id);
        itemsMap[item.id] = {
          id: item.id,
          title: item.title,
          content: existingItem ? existingItem.content : '',
          placeholder: item.placeholder,
          position: existingItem ? { x: existingItem.position_x, y: existingItem.position_y } : { x: 0, y: 0 }
        };
      });

      setItems(itemsMap);
    } catch (error) {
      console.error('Error loading canvas data:', error);
    }
  };

  const createSession = async () => {
    try {
      await api.createSession(canvas.id, userName);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const startSync = () => {
    syncIntervalRef.current = setInterval(async () => {
      try {
        // Update active users
        const usersResponse = await api.getActiveUsers(canvas.id);
        setActiveUsers(usersResponse.data.activeUsers);

        // Auto-save if there are changes
        if (Date.now() - lastSyncRef.current > 5000) { // 5 seconds
          await saveCanvas();
          lastSyncRef.current = Date.now();
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    }, 5000); // Check every 5 seconds
  };

  const saveCanvas = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const itemsArray = Object.values(items).map(item => ({
        type: item.id,
        content: item.content,
        position: item.position
      }));

      await api.updateCanvasItems(canvas.id, itemsArray);
    } catch (error) {
      console.error('Error saving canvas:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleItemClick = (itemId) => {
    setEditingItem(itemId);
  };

  const handleContentChange = (itemId, content) => {
    setItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        content
      }
    }));
    lastSyncRef.current = 0; // Force sync on next interval
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) {
      // Reordering within the same list
      const itemsArray = Object.values(items);
      const [removed] = itemsArray.splice(source.index, 1);
      itemsArray.splice(destination.index, 0, removed);

      const newItems = {};
      itemsArray.forEach(item => {
        newItems[item.id] = item;
      });

      setItems(newItems);
    }
  };

  const exportToJSON = () => {
    const data = {
      title: canvas.title,
      items: Object.values(items),
      exportedAt: new Date().toISOString(),
      exportedBy: userName
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${canvas.title}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();
    pdf.setFont('helvetica');

    // Title
    pdf.setFontSize(20);
    pdf.text(canvas.title, 20, 30);

    // Items
    let yPosition = 50;
    Object.values(items).forEach((item, index) => {
      if (yPosition > 250) { // New page if needed
        pdf.addPage();
        yPosition = 30;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${item.title}`, 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const content = item.content || item.placeholder;
      const lines = pdf.splitTextToSize(content, 170);
      pdf.text(lines, 20, yPosition);
      yPosition += lines.length * 5 + 10;
    });

    pdf.save(`${canvas.title}.pdf`);
  };

  const importFromJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.items) {
          const newItems = {};
          data.items.forEach(item => {
            newItems[item.id] = item;
          });
          setItems(newItems);
          lastSyncRef.current = 0; // Force sync
        }
      } catch (error) {
        alert('JSONファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="canvas-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <button onClick={onBack} className="btn btn-secondary" style={{ marginRight: '10px' }}>
            ← 戻る
          </button>
          <h1>{canvas.title}</h1>
        </div>
        <div>
          <span style={{ marginRight: '10px' }}>ユーザー: {userName}</span>
          {isSaving && <span style={{ color: '#007bff' }}>保存中...</span>}
        </div>
      </div>

      <div className="user-info">
        <h3>アクティブユーザー</h3>
        <div className="active-users">
          {activeUsers.map((user, index) => (
            <span key={index} className="user-tag">
              {user.user_name}
            </span>
          ))}
        </div>
      </div>

      <div className="controls">
        <button onClick={saveCanvas} className="btn btn-primary" disabled={isSaving}>
          保存
        </button>
        <button onClick={exportToJSON} className="btn btn-success">
          JSONエクスポート
        </button>
        <button onClick={exportToPDF} className="btn btn-success">
          PDFエクスポート
        </button>
        <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
          JSONインポート
          <input
            type="file"
            accept=".json"
            onChange={importFromJSON}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="canvas">
          {(provided) => (
            <div
              className="canvas-grid"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {Object.values(items).map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`canvas-item ${item.content ? 'filled' : 'empty'}`}
                      onClick={() => handleItemClick(item.id)}
                    >
                      <div className="canvas-item-title">{item.title}</div>
                      {editingItem === item.id ? (
                        <textarea
                          value={item.content}
                          onChange={(e) => handleContentChange(item.id, e.target.value)}
                          onBlur={() => setEditingItem(null)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              setEditingItem(null);
                            }
                          }}
                          placeholder={item.placeholder}
                          autoFocus
                          style={{
                            width: '100%',
                            minHeight: '80px',
                            border: 'none',
                            outline: 'none',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            fontSize: '14px',
                            lineHeight: '1.4'
                          }}
                        />
                      ) : (
                        <div className="canvas-item-content">
                          {item.content || item.placeholder}
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default Canvas;</content>
<parameter name="filePath">c:\Users\tksna\OneDrive\ドキュメント\04_Codex\06_HypothesisCanvas\frontend\src\components\Canvas.js