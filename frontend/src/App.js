import React, { useState, useEffect } from 'react';
import Canvas from './components/Canvas';
import api from './services/api';
import './App.css';

function App() {
  const [canvases, setCanvases] = useState([]);
  const [currentCanvas, setCurrentCanvas] = useState(null);
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCanvases();
  }, []);

  const loadCanvases = async () => {
    try {
      const response = await api.getCanvases();
      setCanvases(response.data.canvases);
    } catch (error) {
      console.error('Error loading canvases:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewCanvas = async () => {
    const title = prompt('キャンバスのタイトルを入力してください:');
    if (!title) return;

    try {
      const response = await api.createCanvas(title);
      const newCanvas = {
        id: response.data.id,
        title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setCanvases([newCanvas, ...canvases]);
      setCurrentCanvas(newCanvas);
    } catch (error) {
      console.error('Error creating canvas:', error);
      alert('キャンバスの作成に失敗しました。');
    }
  };

  const handleLogin = () => {
    if (!userName.trim()) {
      alert('ユーザー名を入力してください。');
      return;
    }
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    setCurrentCanvas(null);
  };

  if (!isLoggedIn) {
    return (
      <div className="app">
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2>仮説キャンバス</h2>
          <p>チームで戦略を議論しながら作り上げるツール</p>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="ユーザー名を入力"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px' }}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <button
              onClick={handleLogin}
              style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              参加する
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="app"><div style={{ textAlign: 'center', padding: '50px' }}>読み込み中...</div></div>;
  }

  if (currentCanvas) {
    return (
      <div className="app">
        <Canvas
          canvas={currentCanvas}
          userName={userName}
          onBack={() => setCurrentCanvas(null)}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="canvas-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>仮説キャンバス</h1>
          <div>
            <span style={{ marginRight: '10px' }}>こんにちは、{userName}さん</span>
            <button onClick={handleLogout} className="btn btn-secondary">ログアウト</button>
          </div>
        </div>

        <div className="controls">
          <button onClick={createNewCanvas} className="btn btn-primary">
            新しいキャンバスを作成
          </button>
        </div>

        <div>
          <h2>キャンバス一覧</h2>
          {canvases.length === 0 ? (
            <p>まだキャンバスがありません。新しいキャンバスを作成してください。</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {canvases.map(canvas => (
                <div
                  key={canvas.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    cursor: 'pointer',
                    background: 'white',
                    transition: 'box-shadow 0.2s'
                  }}
                  onClick={() => setCurrentCanvas(canvas)}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <h3>{canvas.title}</h3>
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    作成日: {new Date(canvas.created_at).toLocaleDateString('ja-JP')}
                  </p>
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    更新日: {new Date(canvas.updated_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;