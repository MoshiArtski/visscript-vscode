import React, { useState, useCallback } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import styled from 'styled-components';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons from react-icons

// Full-screen app layout
const AppContainer = styled.div`
    height: 100vh;
    width: 100vw;
    position: relative;
    background-color: #1e1e1e;
    color: #ffffff;
    font-family: 'Arial', sans-serif;
    overflow: hidden;
`;

// Menu bar at the top
const MenuBar = styled.div`
    background-color: #333333;
    padding: 5px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #444;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 10;
`;

// Eye icon button for showing/hiding menu bar
const EyeIconButton = styled.button`
    background-color: transparent;
    border: none;
    color: #ffffff;
    font-size: 20px;
    cursor: pointer;
    padding: 5px;
    transition: color 0.2s ease;

    &:hover {
        color: #aaaaaa;
    }
`;

// Styled component for the graph area to take the full background
const GraphArea = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
`;

const MenuButton = styled.button`
    background-color: #444444;
    color: #ffffff;
    padding: 8px 12px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    &:hover {
        background-color: #555555;
    }
`;

const GraphEditor = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isMenuBarVisible, setIsMenuBarVisible] = useState(true); // State for showing/hiding menu bar

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', style: { stroke: '#3498db', strokeWidth: 2 } }, eds)),
        []
    );

    const onAdd = useCallback(() => {
        const newNode = {
            id: `${Date.now()}`,
            data: { label: `Node ${nodes.length + 1}` },
            position: { x: Math.random() * 500, y: Math.random() * 500 },
            style: { backgroundColor: '#1e1e1e', borderRadius: '10px', padding: '10px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)', color: '#ffffff' },
        };
        setNodes((nds) => [...nds, newNode]);
    }, [nodes]);

    return (
        <AppContainer>
            {/* Menu Bar */}
            {isMenuBarVisible && (
                <MenuBar>
                    <div>
                        <MenuButton onClick={onAdd}>Add Node</MenuButton>
                    </div>
                    {/* Eye icon to toggle visibility */}
                    <EyeIconButton onClick={() => setIsMenuBarVisible(false)}>
                        <FaEyeSlash />
                    </EyeIconButton>
                </MenuBar>
            )}
            {/* Eye icon when the menu is hidden */}
            {!isMenuBarVisible && (
                <EyeIconButton
                    style={{ position: 'absolute', top: 5, right: 5, zIndex: 10 }}
                    onClick={() => setIsMenuBarVisible(true)}
                >
                    <FaEye />
                </EyeIconButton>
            )}

            {/* Graph Area */}
            <GraphArea>
                <ReactFlowProvider>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        fitView
                        style={{ width: '100%', height: '100%' }}
                    >
                        <Controls />
                        <Background color="#3d3d3d" gap={24} size={1.5} />
                    </ReactFlow>
                </ReactFlowProvider>
            </GraphArea>
        </AppContainer>
    );
};

export default GraphEditor;
