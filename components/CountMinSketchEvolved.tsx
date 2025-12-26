'use client';

import React, { useState, useEffect } from 'react';

// Simple hash function
const simpleHash = (str: string, seed: number, max: number): number => {
    let hash = seed;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) % max;
};

interface ItemData {
    name: string;
    color: string;
    count: number;
}

const CountMinSketchEvolved = () => {
    const [sketchRows] = useState(4);
    const [sketchCols] = useState(10);
    const [sketchTable, setSketchTable] = useState<number[][]>(
        Array(4).fill(0).map(() => Array(10).fill(0))
    );
    const [items, setItems] = useState<ItemData[]>([
        { name: 'apple', color: '#ef4444', count: 0 },
        { name: 'banana', color: '#eab308', count: 0 },
        { name: 'cherry', color: '#dc2626', count: 0 },
        { name: 'date', color: '#a16207', count: 0 },
        { name: 'elderberry', color: '#7c3aed', count: 0 },
    ]);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [lastHashedIndices, setLastHashedIndices] = useState<{ row: number, col: number }[]>([]);
    const [activeLesson, setActiveLesson] = useState(1);
    const [inputItem, setInputItem] = useState('');
    const [queryResult, setQueryResult] = useState<string | null>(null);

    const addItem = (itemName: string) => {
        const cleanItem = itemName.trim().toLowerCase();
        if (!cleanItem) return;

        const newTable = [...sketchTable.map(row => [...row])];
        const newHashedIndices: { row: number, col: number }[] = [];

        for (let r = 0; r < sketchRows; r++) {
            const col = simpleHash(cleanItem, r * 1337, sketchCols);
            newTable[r][col] += 1;
            newHashedIndices.push({ row: r, col });
        }

        setSketchTable(newTable);
        setLastHashedIndices(newHashedIndices);
        setSelectedItem(cleanItem);

        // Update item counts
        const existingItem = items.find(i => i.name === cleanItem);
        if (existingItem) {
            setItems(items.map(i => i.name === cleanItem ? { ...i, count: i.count + 1 } : i));
        }

        setActiveLesson(2);
    };

    const queryItem = (itemName: string) => {
        const cleanItem = itemName.trim().toLowerCase();
        if (!cleanItem) return;

        let min = Infinity;
        const indices: { row: number, col: number }[] = [];

        for (let r = 0; r < sketchRows; r++) {
            const col = simpleHash(cleanItem, r * 1337, sketchCols);
            min = Math.min(min, sketchTable[r][col]);
            indices.push({ row: r, col });
        }

        setLastHashedIndices(indices);
        setSelectedItem(cleanItem);
        const actualCount = items.find(i => i.name === cleanItem)?.count || 0;
        setQueryResult(`Estimated: ${min === Infinity ? 0 : min}, Actual: ${actualCount}`);
        setActiveLesson(3);
    };

    const reset = () => {
        setSketchTable(Array(sketchRows).fill(0).map(() => Array(sketchCols).fill(0)));
        setItems(items.map(i => ({ ...i, count: 0 })));
        setLastHashedIndices([]);
        setSelectedItem(null);
        setQueryResult(null);
        setActiveLesson(1);
    };

    const getMaxCount = () => Math.max(...sketchTable.flat(), 1);

    return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-lg overflow-hidden" style={{ minHeight: '650px' }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b-2 border-amber-300 dark:border-amber-600">
                <h3 className="text-xl font-bold text-amber-900 dark:text-amber-200">Count-Min Sketch: Interactive Educational Demo</h3>
                <p className="text-sm text-amber-700 dark:text-amber-400 italic">Estimating frequency in large streams with limited space</p>
            </div>

            <div className="flex p-4 gap-4" style={{ height: '580px' }}>
                {/* Left: Lessons */}
                <div className="w-1/3 bg-white dark:bg-slate-800 rounded-lg p-4 overflow-y-auto border border-amber-200 dark:border-slate-700">
                    <h4 className="text-base font-bold text-amber-900 dark:text-amber-200 mb-4 pb-2 border-b-2 border-amber-300 dark:border-amber-600">Learning Path</h4>

                    <div className={`p-3 rounded-lg mb-3 border-2 transition-all ${activeLesson === 1 ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-400' : 'border-transparent'}`}>
                        <h5 className="text-sm font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                            <span className="w-6 h-6 bg-amber-400 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                            What is Count-Min Sketch?
                        </h5>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 leading-relaxed">
                            A probabilistic data structure that uses multiple hash functions to estimate item frequencies with sub-linear space.
                        </p>
                        <div className="bg-amber-100 dark:bg-amber-900/50 border-l-4 border-amber-400 p-2 mt-2 text-xs italic text-amber-800 dark:text-amber-300">
                            Key insight: Trade exact counts for memory efficiency!
                        </div>
                    </div>

                    <div className={`p-3 rounded-lg mb-3 border-2 transition-all ${activeLesson === 2 ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-400' : 'border-transparent'}`}>
                        <h5 className="text-sm font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                            <span className="w-6 h-6 bg-amber-400 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                            Adding Items
                        </h5>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 leading-relaxed">
                            Each item is hashed by multiple functions. Each hash maps to a column. We increment all mapped cells.
                        </p>
                    </div>

                    <div className={`p-3 rounded-lg mb-3 border-2 transition-all ${activeLesson === 3 ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-400' : 'border-transparent'}`}>
                        <h5 className="text-sm font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                            <span className="w-6 h-6 bg-amber-400 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                            Querying Counts
                        </h5>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 leading-relaxed">
                            To estimate frequency, hash the item again and take the <strong>minimum</strong> of all cells. This gives an upper bound (may overestimate due to collisions).
                        </p>
                    </div>

                    <div className="p-3 rounded-lg border-2 border-transparent">
                        <h5 className="text-sm font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                            <span className="w-6 h-6 bg-amber-400 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                            Why Multiple Hash Functions?
                        </h5>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 leading-relaxed">
                            Collisions are inevitable. Using multiple independent hashes reduces the probability that ALL cells collide, improving accuracy.
                        </p>
                    </div>
                </div>

                {/* Center: Visualization */}
                <div className="w-2/5 flex flex-col gap-3">
                    {/* Items */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-amber-200 dark:border-slate-700">
                        <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-2 pb-1 border-b border-amber-200 dark:border-slate-600">Click to Add Item</h4>
                        <div className="flex flex-wrap gap-2">
                            {items.map(item => (
                                <button
                                    key={item.name}
                                    onClick={() => addItem(item.name)}
                                    className={`px-3 py-1.5 rounded-full text-white text-xs font-bold transition-all hover:scale-105 shadow-md ${selectedItem === item.name ? 'ring-2 ring-offset-2 ring-amber-500' : ''}`}
                                    style={{ backgroundColor: item.color }}
                                >
                                    {item.name} {item.count > 0 && `(${item.count})`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg p-4 border border-amber-200 dark:border-slate-700">
                        <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-3 text-center">Sketch Table</h4>
                        <div className="flex flex-col gap-2">
                            {sketchTable.map((row, rIdx) => (
                                <div key={rIdx} className="flex items-center gap-2">
                                    <div className="w-10 text-right text-xs font-bold text-amber-600 dark:text-amber-400 pr-1">h{rIdx + 1}(x)</div>
                                    <div className="flex flex-1 gap-1">
                                        {row.map((val, cIdx) => {
                                            const isHashed = lastHashedIndices.some(idx => idx.row === rIdx && idx.col === cIdx);
                                            const intensity = val / getMaxCount();
                                            return (
                                                <div
                                                    key={cIdx}
                                                    className={`flex-1 aspect-square flex items-center justify-center rounded text-xs font-mono font-bold transition-all duration-300 border-2 ${isHashed
                                                            ? 'border-amber-500 scale-110 shadow-lg z-10 bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                                                            : 'border-amber-200 dark:border-slate-600 text-amber-800 dark:text-amber-200'
                                                        }`}
                                                    style={{
                                                        backgroundColor: isHashed ? undefined : `rgba(251, 191, 36, ${intensity * 0.5})`,
                                                    }}
                                                >
                                                    {val}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="w-1/4 flex flex-col gap-3">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-amber-200 dark:border-slate-700">
                        <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-3 pb-1 border-b border-amber-200 dark:border-slate-600">Add Custom Item</h4>
                        <input
                            type="text"
                            placeholder="Type item name..."
                            value={inputItem}
                            onChange={(e) => setInputItem(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addItem(inputItem)}
                            className="w-full px-3 py-2 border-2 border-amber-300 dark:border-slate-600 rounded-lg text-sm bg-amber-50 dark:bg-slate-700 text-amber-900 dark:text-amber-100 focus:outline-none focus:border-amber-500"
                        />
                        <button
                            onClick={() => { addItem(inputItem); setInputItem(''); }}
                            className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-lg font-bold text-sm hover:from-amber-500 hover:to-orange-500 transition-all shadow-md"
                        >
                            ➕ Add
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-amber-200 dark:border-slate-700">
                        <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-3 pb-1 border-b border-amber-200 dark:border-slate-600">Query Count</h4>
                        <div className="flex flex-wrap gap-1">
                            {items.filter(i => i.count > 0).map(item => (
                                <button
                                    key={item.name}
                                    onClick={() => queryItem(item.name)}
                                    className="px-2 py-1 bg-amber-100 dark:bg-slate-700 text-amber-800 dark:text-amber-200 rounded text-xs font-bold hover:bg-amber-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    ? {item.name}
                                </button>
                            ))}
                        </div>
                        {queryResult && (
                            <div className="mt-3 p-3 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-slate-700 dark:to-slate-600 rounded-lg border-2 border-amber-300 dark:border-amber-600 text-sm font-bold text-amber-900 dark:text-amber-100 text-center">
                                {queryResult}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={reset}
                        className="px-4 py-3 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-lg font-bold text-sm hover:from-slate-600 hover:to-slate-700 transition-all shadow-md"
                    >
                        🗑️ Reset All
                    </button>

                    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-lg p-4 text-white">
                        <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-2">Mathematical Bound</h4>
                        <p className="text-sm font-mono leading-tight">
                            Estimate ≥ Real Count<br />
                            <span className="text-xs text-indigo-300 opacity-80">(Always an over-estimate)</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CountMinSketchEvolved;
