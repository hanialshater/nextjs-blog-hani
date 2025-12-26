'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface TreeNode {
    array: number[];
    start: number;
    end: number;
    depth: number;
    index: number;
    state: 'pending' | 'dividing' | 'divided' | 'merging' | 'sorted';
    left: TreeNode | null;
    right: TreeNode | null;
    x: number;
    y: number;
    compareIndices: { left: number; right: number } | null;
}

interface Step {
    type: 'divide' | 'single' | 'compare' | 'place' | 'merge_complete';
    node: TreeNode;
    message: string;
    leftIndex?: number;
    rightIndex?: number;
    leftValue?: number;
    rightValue?: number;
    value?: number;
    from?: string;
    merged?: number[];
}

const MergeSortEvolved = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [array, setArray] = useState<number[]>([]);
    const [root, setRoot] = useState<TreeNode | null>(null);
    const [steps, setSteps] = useState<Step[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [comparisons, setComparisons] = useState(0);
    const [merges, setMerges] = useState(0);
    const [phase, setPhase] = useState('Ready');
    const [statusMessage, setStatusMessage] = useState('Click Play to start the merge sort visualization');
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const buildTreeRecursive = useCallback((arr: number[], start: number, end: number, depth: number, index: number): TreeNode | null => {
        if (start >= end) return null;

        const node: TreeNode = {
            array: arr.slice(start, end),
            start,
            end,
            depth,
            index,
            state: 'pending',
            left: null,
            right: null,
            x: 0,
            y: 0,
            compareIndices: null,
        };

        if (end - start > 1) {
            const mid = Math.floor((start + end) / 2);
            node.left = buildTreeRecursive(arr, start, mid, depth + 1, index * 2);
            node.right = buildTreeRecursive(arr, mid, end, depth + 1, index * 2 + 1);
        }

        return node;
    }, []);

    const getMaxDepth = (node: TreeNode | null): number => {
        if (!node) return 0;
        return 1 + Math.max(getMaxDepth(node.left), getMaxDepth(node.right));
    };

    const calculatePositions = useCallback((rootNode: TreeNode, canvasWidth: number) => {
        const nodeWidth = 90;
        const horizontalGap = 10;
        const verticalGap = 80;

        const positions = new Map<number, TreeNode[]>();

        const calculateLevel = (node: TreeNode | null, depth: number) => {
            if (!node) return;
            if (!positions.has(depth)) {
                positions.set(depth, []);
            }
            positions.get(depth)!.push(node);
            calculateLevel(node.left, depth + 1);
            calculateLevel(node.right, depth + 1);
        };

        calculateLevel(rootNode, 0);

        positions.forEach((nodes, depth) => {
            const totalWidth = nodes.length * nodeWidth + (nodes.length - 1) * horizontalGap;
            const startX = (canvasWidth - totalWidth) / 2;
            nodes.forEach((node, i) => {
                node.x = startX + i * (nodeWidth + horizontalGap) + nodeWidth / 2;
                node.y = 50 + depth * verticalGap;
            });
        });
    }, []);

    const generateDivisionSteps = (node: TreeNode | null, allSteps: Step[]) => {
        if (!node || node.array.length === 1) {
            if (node) {
                allSteps.push({
                    type: 'single',
                    node,
                    message: `Single element [${node.array[0]}] - base case reached`,
                });
            }
            return;
        }

        allSteps.push({
            type: 'divide',
            node,
            message: `Dividing [${node.array.join(', ')}] into two halves`,
        });

        if (node.left) generateDivisionSteps(node.left, allSteps);
        if (node.right) generateDivisionSteps(node.right, allSteps);
    };

    const generateMergeSteps = (node: TreeNode | null, allSteps: Step[]): number[] => {
        if (!node) return [];

        if (!node.left && !node.right) {
            return [node.array[0]];
        }

        const leftSorted = node.left ? generateMergeSteps(node.left, allSteps) : [];
        const rightSorted = node.right ? generateMergeSteps(node.right, allSteps) : [];

        const merged: number[] = [];
        let i = 0, j = 0;

        while (i < leftSorted.length && j < rightSorted.length) {
            allSteps.push({
                type: 'compare',
                node,
                leftIndex: i,
                rightIndex: j,
                leftValue: leftSorted[i],
                rightValue: rightSorted[j],
                message: `Comparing ${leftSorted[i]} and ${rightSorted[j]}`,
            });

            if (leftSorted[i] <= rightSorted[j]) {
                merged.push(leftSorted[i]);
                allSteps.push({
                    type: 'place',
                    node,
                    value: leftSorted[i],
                    from: 'left',
                    merged: [...merged],
                    message: `Placing ${leftSorted[i]} (from left)`,
                });
                i++;
            } else {
                merged.push(rightSorted[j]);
                allSteps.push({
                    type: 'place',
                    node,
                    value: rightSorted[j],
                    from: 'right',
                    merged: [...merged],
                    message: `Placing ${rightSorted[j]} (from right)`,
                });
                j++;
            }
        }

        while (i < leftSorted.length) {
            merged.push(leftSorted[i]);
            allSteps.push({
                type: 'place',
                node,
                value: leftSorted[i],
                from: 'left',
                merged: [...merged],
                message: `Placing remaining ${leftSorted[i]} (from left)`,
            });
            i++;
        }

        while (j < rightSorted.length) {
            merged.push(rightSorted[j]);
            allSteps.push({
                type: 'place',
                node,
                value: rightSorted[j],
                from: 'right',
                merged: [...merged],
                message: `Placing remaining ${rightSorted[j]} (from right)`,
            });
            j++;
        }

        allSteps.push({
            type: 'merge_complete',
            node,
            merged,
            message: `Merge complete: [${merged.join(', ')}]`,
        });

        return merged;
    };

    const generateNewArray = useCallback(() => {
        const newArray = Array.from({ length: 8 }, () => Math.floor(Math.random() * 90) + 10);
        setArray(newArray);
        setCurrentStep(0);
        setIsPlaying(false);
        setComparisons(0);
        setMerges(0);
        setPhase('Ready');
        setStatusMessage('Click Play to start the merge sort visualization');

        const newRoot = buildTreeRecursive(newArray, 0, newArray.length, 0, 0);
        if (newRoot && containerRef.current) {
            calculatePositions(newRoot, containerRef.current.clientWidth);
        }
        setRoot(newRoot);

        // Generate steps
        const allSteps: Step[] = [];
        if (newRoot) {
            generateDivisionSteps(newRoot, allSteps);
            generateMergeSteps(newRoot, allSteps);
        }
        setSteps(allSteps);
    }, [buildTreeRecursive, calculatePositions]);

    useEffect(() => {
        generateNewArray();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const resizeCanvas = () => {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            if (root) {
                calculatePositions(root, container.clientWidth);
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [root, calculatePositions]);

    // Draw function
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !root) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const drawConnections = (node: TreeNode) => {
            ctx.strokeStyle = '#d0d0d0';
            ctx.lineWidth = 2;

            if (node.left) {
                ctx.beginPath();
                ctx.moveTo(node.x, node.y + 25);
                ctx.lineTo(node.left.x, node.left.y - 25);
                ctx.stroke();
                drawConnections(node.left);
            }

            if (node.right) {
                ctx.beginPath();
                ctx.moveTo(node.x, node.y + 25);
                ctx.lineTo(node.right.x, node.right.y - 25);
                ctx.stroke();
                drawConnections(node.right);
            }
        };

        const drawNode = (node: TreeNode) => {
            const width = 90;
            const height = 50;
            const x = node.x - width / 2;
            const y = node.y - height / 2;

            let color = '#e0e0e0';
            if (node.state === 'dividing') color = '#3b82f6';
            else if (node.state === 'divided') color = '#93c5fd';
            else if (node.state === 'merging') color = '#10b981';
            else if (node.state === 'sorted') color = '#fbbf24';

            ctx.fillStyle = color;
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(x, y, width, height, 6);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#000';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const text = node.array.length > 4
                ? `[${node.array.slice(0, 3).join(',')}...]`
                : `[${node.array.join(',')}]`;
            ctx.fillText(text, node.x, node.y);

            if (node.left) drawNode(node.left);
            if (node.right) drawNode(node.right);
        };

        drawConnections(root);
        drawNode(root);
    }, [root, currentStep]);

    const executeStep = useCallback(() => {
        if (currentStep >= steps.length) {
            setIsPlaying(false);
            setStatusMessage('Sorting complete!');
            setPhase('Complete');
            return;
        }

        const step = steps[currentStep];

        switch (step.type) {
            case 'divide':
                step.node.state = 'dividing';
                setPhase('Divide');
                break;
            case 'single':
                step.node.state = 'divided';
                break;
            case 'compare':
                step.node.state = 'merging';
                step.node.compareIndices = { left: step.leftIndex!, right: step.rightIndex! };
                setComparisons(c => c + 1);
                setPhase('Merge');
                break;
            case 'place':
                step.node.array = step.merged!;
                step.node.compareIndices = null;
                break;
            case 'merge_complete':
                step.node.state = 'sorted';
                step.node.array = step.merged!;
                setMerges(m => m + 1);
                break;
        }

        setStatusMessage(step.message);
        setCurrentStep(c => c + 1);
    }, [currentStep, steps]);

    useEffect(() => {
        if (isPlaying && currentStep < steps.length) {
            timerRef.current = setTimeout(executeStep, 500);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isPlaying, currentStep, executeStep, steps.length]);

    const handlePlay = () => {
        if (!isPlaying && currentStep < steps.length) {
            setIsPlaying(true);
        }
    };

    const handlePause = () => {
        setIsPlaying(false);
    };

    const handleStep = () => {
        if (!isPlaying && currentStep < steps.length) {
            executeStep();
        }
    };

    const handleReset = () => {
        generateNewArray();
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-5 max-w-5xl mx-auto" style={{ height: '600px' }}>
            <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Merge Sort - Recursive Tree Visualization</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Watch the divide-and-conquer strategy in action</p>
            </div>

            <div className="flex gap-3 mb-4 flex-wrap items-center">
                <button
                    onClick={handlePlay}
                    disabled={isPlaying || currentStep >= steps.length}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-semibold text-sm disabled:opacity-50 hover:bg-indigo-600 transition-colors"
                >
                    Play
                </button>
                <button
                    onClick={handlePause}
                    disabled={!isPlaying}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold text-sm disabled:opacity-50 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                    Pause
                </button>
                <button
                    onClick={handleStep}
                    disabled={isPlaying || currentStep >= steps.length}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold text-sm disabled:opacity-50 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                    Step
                </button>
                <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                    Reset
                </button>

                <div className="flex gap-5 text-sm text-slate-600 dark:text-slate-400 ml-auto">
                    <div className="flex items-center gap-2">
                        <span>Comparisons:</span>
                        <span className="font-bold text-indigo-500 text-lg">{comparisons}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Merges:</span>
                        <span className="font-bold text-indigo-500 text-lg">{merges}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Phase:</span>
                        <span className="font-bold text-indigo-500 text-lg">{phase}</span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-lg mb-4 text-sm text-slate-700 dark:text-slate-300 min-h-[44px] flex items-center">
                {statusMessage}
            </div>

            <div ref={containerRef} className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-slate-200 dark:border-slate-700 p-4 relative" style={{ height: '350px' }}>
                <canvas ref={canvasRef} className="w-full h-full" />
                <div className="absolute top-4 right-4 bg-white dark:bg-slate-900 p-3 rounded-lg shadow-md text-xs">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-3 rounded bg-blue-500"></div>
                        <span className="text-slate-600 dark:text-slate-400">Dividing</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-3 rounded bg-emerald-500"></div>
                        <span className="text-slate-600 dark:text-slate-400">Merging</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-3 rounded bg-amber-400"></div>
                        <span className="text-slate-600 dark:text-slate-400">Sorted</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-3 rounded bg-red-500"></div>
                        <span className="text-slate-600 dark:text-slate-400">Comparing</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MergeSortEvolved;
