import { useState, useMemo, useEffect } from 'react';
import { Minus, Plus, Settings2, ShieldQuestion, ShieldAlert, BadgeCheck, Check, Skull, Edit2, Trash2, Copy, FilePlus } from 'lucide-react';
import { traits, occupations, createBaseSkills, getExclusions, Skill, Trait, Occupation } from './data';
import { cn } from './lib/utils';

interface Loadout {
  id: string;
  name: string;
  starterPoints: number;
  occupationId: string;
  traitIds: string[];
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export default function App() {
  const [loadouts, setLoadouts] = useState<Loadout[]>(() => {
    try {
      const saved = localStorage.getItem('pz-loadouts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [{ id: generateId(), name: 'Build 1', starterPoints: 0, occupationId: 'custom', traitIds: [] }];
  });

  const [activeLoadoutId, setActiveLoadoutId] = useState<string>(loadouts[0]?.id);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  
  const activeLoadout = loadouts.find(l => l.id === activeLoadoutId) || loadouts[0];
  
  useEffect(() => {
    localStorage.setItem('pz-loadouts', JSON.stringify(loadouts));
  }, [loadouts]);

  const updateActiveLoadout = (updates: Partial<Loadout>) => {
    setLoadouts(prev => prev.map(l => l.id === activeLoadout.id ? { ...l, ...updates } : l));
  };

  const starterPoints = activeLoadout.starterPoints;
  const setStarterPoints = (val: number | ((prev: number) => number)) => {
    const newVal = typeof val === 'function' ? val(starterPoints) : val;
    updateActiveLoadout({ starterPoints: newVal });
  };
  const selectedOccupationId = activeLoadout.occupationId;
  const setSelectedOccupationId = (id: string) => updateActiveLoadout({ occupationId: id });
  const selectedTraitIds = activeLoadout.traitIds;
  
  const startEditingName = () => {
    setTempName(activeLoadout.name);
    setIsEditingName(true);
  };

  const saveName = () => {
    if (tempName.trim()) updateActiveLoadout({ name: tempName.trim() });
    setIsEditingName(false);
  };

  const createLoadout = () => {
    const id = generateId();
    setLoadouts(prev => [...prev, { id, name: `Build ${prev.length + 1}`, starterPoints: 0, occupationId: 'custom', traitIds: [] }]);
    setActiveLoadoutId(id);
  };

  const duplicateLoadout = () => {
    const id = generateId();
    setLoadouts(prev => [...prev, { ...activeLoadout, id, name: `${activeLoadout.name} (Copy)` }]);
    setActiveLoadoutId(id);
  };

  const deleteLoadout = () => {
    if (loadouts.length <= 1) return;
    const newLoadouts = loadouts.filter(l => l.id !== activeLoadout.id);
    setLoadouts(newLoadouts);
    setActiveLoadoutId(newLoadouts[0].id);
  };

  const selectedOccupation = useMemo(() => 
    occupations.find(o => o.id === selectedOccupationId) || occupations[0]
  , [selectedOccupationId]);

  // Handle trait toggling
  const toggleTrait = (traitId: string) => {
    const prev = selectedTraitIds;
    if (prev.includes(traitId)) {
      updateActiveLoadout({ traitIds: prev.filter(id => id !== traitId) });
      return;
    }
    
    const newTraits = [...prev, traitId];
    // Remove any mutually exclusive traits
    const exclusions = getExclusions(traitId);
    updateActiveLoadout({ traitIds: newTraits.filter(id => !exclusions.includes(id)) });
  };

  // Compute final state
  const { availablePoints, finalSkills, currentTraits } = useMemo(() => {
    let points = starterPoints + selectedOccupation.points;
    let base = createBaseSkills();
    
    // Add occupation modifiers
    if (selectedOccupation.modifiers) {
      Object.entries(selectedOccupation.modifiers).forEach(([skill, val]) => {
        base[skill as Skill] += val as number;
      });
    }

    const currentTraitsList: Trait[] = [];

    // Add free traits from occupation
    if (selectedOccupation.freeTraits) {
      selectedOccupation.freeTraits.forEach(freeTraitId => {
        const freeTrait = traits.find(t => t.id === freeTraitId);
        if (freeTrait) {
          currentTraitsList.push(freeTrait);
          if (freeTrait.modifiers) {
            Object.entries(freeTrait.modifiers).forEach(([skill, val]) => {
              base[skill as Skill] += val as number;
            });
          }
        }
      });
    }

    // Add selected traits
    selectedTraitIds.forEach(traitId => {
      const trait = traits.find(t => t.id === traitId);
      if (trait) {
        currentTraitsList.push(trait);
        points += trait.cost; // cost is negative for positive, positive for negative
        if (trait.modifiers) {
          Object.entries(trait.modifiers).forEach(([skill, val]) => {
            base[skill as Skill] += val as number;
          });
        }
      }
    });

    return { availablePoints: points, finalSkills: base, currentTraits: currentTraitsList };
  }, [starterPoints, selectedOccupation, selectedTraitIds]);

  const excludedTraitsContext = useMemo(() => {
    const list = new Set<string>();
    selectedTraitIds.forEach(id => {
      getExclusions(id).forEach(ex => list.add(ex));
    });
    return list;
  }, [selectedTraitIds]);

  // Group traits
  const positiveTraits = traits.filter(t => t.type === 'positive').sort((a, b) => b.cost - a.cost); // cost goes from -1 to -10, so sort by magnitude? Wait, b.cost - a.cost means -1 - (-10) = 9 -> -10 is at bottom. So let's sort by cost descending. Wait, -1 is first, -10 is last. That makes sense, cheaper traits first.
  const negativeTraits = traits.filter(t => t.type === 'negative').sort((a, b) => a.cost - b.cost); // cost goes from 1 to 12. 1 first, 12 last.

  const isPointsValid = availablePoints >= 0;

  return (
    <div className="min-h-screen bg-[#0c0d10] text-[#a0a5b0] font-sans selection:bg-red-900 selection:text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#14161b] border-b border-[#1f2228] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-red-600 rounded-sm flex items-center justify-center font-bold text-white"><Skull className="w-5 h-5"/></div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold tracking-wider uppercase text-white leading-tight">Project Zomboid</h1>
            <p className="text-[10px] text-[#5e636e] uppercase tracking-widest font-mono">Character Architect</p>
          </div>
          
          <div className="h-8 w-px bg-[#1f2228] mx-2 hidden sm:block"></div>
          
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <input 
                value={tempName} 
                onChange={e => setTempName(e.target.value)} 
                onBlur={saveName}
                onKeyDown={e => e.key === 'Enter' && saveName()}
                autoFocus 
                className="bg-[#0c0d10] text-sm text-white border border-[#31363f] rounded px-2 py-1 w-40 focus:outline-none focus:border-red-600"
              />
            ) : (
              <div className="flex items-center gap-2 group relative">
                <select 
                  value={activeLoadout.id}
                  onChange={(e) => setActiveLoadoutId(e.target.value)}
                  className="bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer appearance-none pr-4 hover:text-red-400 transition-colors"
                >
                  {loadouts.map(l => (
                    <option key={l.id} value={l.id} className="bg-[#14161b]">{l.name}</option>
                  ))}
                </select>
                <button onClick={startEditingName} className="opacity-0 group-hover:opacity-100 text-[#5e636e] hover:text-white transition-opacity"><Edit2 className="w-3 h-3" /></button>
              </div>
            )}
            
            <div className="flex items-center gap-1 ml-2">
              <button onClick={createLoadout} className="p-1.5 text-[#5e636e] hover:text-white hover:bg-[#1f2228] rounded transition-colors" title="New Build"><FilePlus className="w-4 h-4" /></button>
              <button onClick={duplicateLoadout} className="p-1.5 text-[#5e636e] hover:text-white hover:bg-[#1f2228] rounded transition-colors" title="Duplicate Build"><Copy className="w-4 h-4" /></button>
              {loadouts.length > 1 && (
                <button onClick={deleteLoadout} className="p-1.5 text-[#5e636e] hover:text-red-500 hover:bg-red-950/30 rounded transition-colors" title="Delete Build"><Trash2 className="w-4 h-4" /></button>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <label className="text-[10px] uppercase tracking-widest text-[#5e636e] mb-1">Starter Points</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setStarterPoints(p => p - 1)} className="p-1 hover:bg-[#1f2228] rounded text-[#5e636e] hover:text-white"><Minus className="w-3 h-3" /></button>
              <input 
                type="number" 
                value={starterPoints} 
                onChange={(e) => setStarterPoints(Number(e.target.value) || 0)}
                className="w-12 bg-transparent border-b border-[#31363f] text-center text-white focus:outline-none focus:border-red-600 font-mono py-1"
              />
              <button onClick={() => setStarterPoints(p => p + 1)} className="p-1 hover:bg-[#1f2228] rounded text-[#5e636e] hover:text-white"><Plus className="w-3 h-3" /></button>
            </div>
          </div>
          <div className="h-10 w-px bg-[#1f2228] hidden sm:block"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-[#5e636e]">Points Remaining</span>
            <span className={cn("text-2xl font-bold font-mono tracking-tight", isPointsValid ? "text-green-500" : "text-red-500")}>
              {availablePoints}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Occupation */}
        <section className="lg:col-span-3 flex flex-col gap-2 overflow-hidden h-[calc(100vh-120px)] sticky top-[104px]">
          <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#5e636e] pb-1 border-b border-[#1f2228] flex items-center gap-2">
            <Settings2 className="w-3 h-3" /> Occupation
          </h2>
          <div className="flex-grow overflow-y-auto pr-1 space-y-1 scrollbar-thin scrollbar-thumb-[#1f2228]">
            {occupations.map(occ => (
              <button
                key={occ.id}
                onClick={() => setSelectedOccupationId(occ.id)}
                className={cn(
                  "w-full text-left p-3 border-y border-r border-l-2 transition-all flex flex-col group",
                  selectedOccupationId === occ.id 
                    ? "bg-[#14161b] border-y-red-900/50 border-r-red-900/50 border-l-red-500 shadow-sm"
                    : "bg-[#0c0d10] border-[#1f2228] hover:bg-[#14161b] hover:border-[#31363f] hover:border-l-[#5e636e]"
                )}
              >
            <div className="flex justify-between items-center w-full mb-1">
              <span className={cn("text-sm transition-colors", selectedOccupationId === occ.id ? "text-white font-semibold" : "text-[#a0a5b0] group-hover:text-stone-300")}>{occ.name}</span>
              <span className={cn("font-mono text-sm transition-colors", occ.points > 0 ? "text-green-500" : occ.points < 0 ? "text-red-500" : "text-[#5e636e]")}>
                {occ.points > 0 ? `+${occ.points}` : occ.points}
              </span>
            </div>
            {occ.description && (
              <p className={cn("text-[10px] italic mb-1 transition-colors", selectedOccupationId === occ.id ? "text-[#808796]" : "text-[#5e636e] group-hover:text-[#808796]")}>{occ.description}</p>
            )}
            {(occ.modifiers && Object.keys(occ.modifiers).length > 0) || (occ.freeTraits && occ.freeTraits.length > 0) ? (
              <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                {occ.modifiers && Object.entries(occ.modifiers).map(([k, v]) => (
                  <span key={k} className="text-[9px] font-mono text-amber-500/80 bg-amber-900/10 px-1 py-0.5 rounded border border-amber-900/30">
                    {v > 0 ? '+' : ''}{v} {k}
                  </span>
                ))}
                {occ.freeTraits && occ.freeTraits.map(tId => {
                  const trait = traits.find(t => t.id === tId);
                  if (!trait) return null;
                  return (
                    <span key={tId} className="text-[9px] font-mono text-blue-400/80 bg-blue-900/10 px-1 py-0.5 rounded border border-blue-900/30">
                      {trait.name}
                    </span>
                  );
                })}
              </div>
            ) : null}
              </button>
            ))}
          </div>
        </section>

        {/* Middle Column: Traits */}
        <section className="lg:col-span-6 flex flex-col gap-4 border-x border-[#1f2228] px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            
            {/* Positive Traits */}
            <div className="flex flex-col gap-2 overflow-hidden h-[calc(100vh-120px)] sticky top-[104px]">
              <h2 className="text-[11px] uppercase tracking-widest font-bold text-green-600 pb-1 border-b border-green-900/30 flex items-center gap-2">
                <BadgeCheck className="w-3 h-3" /> Positive Traits
              </h2>
              <div className="overflow-y-auto pr-1 flex-1 scrollbar-thin scrollbar-thumb-[#1f2228] grid grid-cols-1 gap-1 content-start">
                {positiveTraits.map(trait => {
                  const isSelected = selectedTraitIds.includes(trait.id);
                  const isExcluded = excludedTraitsContext.has(trait.id) && !isSelected;
                  
                  return (
                    <TraitButton 
                      key={trait.id} 
                      trait={trait} 
                      isSelected={isSelected} 
                      isExcluded={isExcluded}
                      onClick={() => toggleTrait(trait.id)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Negative Traits */}
            <div className="flex flex-col gap-2 overflow-hidden h-[calc(100vh-120px)] sticky top-[104px]">
              <h2 className="text-[11px] uppercase tracking-widest font-bold text-red-600 pb-1 border-b border-red-900/30 flex items-center gap-2">
                <ShieldAlert className="w-3 h-3" /> Negative Traits
              </h2>
              <div className="overflow-y-auto pr-1 flex-1 scrollbar-thin scrollbar-thumb-[#1f2228] grid grid-cols-1 gap-1 content-start">
                {negativeTraits.map(trait => {
                  const isSelected = selectedTraitIds.includes(trait.id);
                  const isExcluded = excludedTraitsContext.has(trait.id) && !isSelected;
                  
                  return (
                    <TraitButton 
                      key={trait.id} 
                      trait={trait} 
                      isSelected={isSelected} 
                      isExcluded={isExcluded}
                      onClick={() => toggleTrait(trait.id)}
                    />
                  );
                })}
              </div>
            </div>
            
          </div>
        </section>

        {/* Right Column: Character Overview */}
        <section className="lg:col-span-3 flex flex-col gap-4 overflow-hidden bg-[#14161b]/30 p-2 h-[calc(100vh-120px)] sticky top-[104px]">
          
          <div className="bg-[#14161b] p-4 border border-[#1f2228] overflow-hidden flex flex-col shrink-0 max-h-[50%]">
            <h2 className="text-[10px] uppercase tracking-widest text-[#5e636e] mb-3 flex items-center gap-2">
              <ShieldQuestion className="w-3 h-3" /> Skills & Boosts
            </h2>
            <div className="space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#1f2228]">
              {Object.entries(finalSkills).filter(([skill, val]) => (val as number) > 0 || skill === 'Fitness' || skill === 'Strength').sort((a,b) => (b[1] as number) - (a[1] as number)).map(([skill, valStr]) => {
                const val = valStr as number;
                let xpBoost = "";
                if (skill !== 'Fitness' && skill !== 'Strength') {
                  if (val === 1) xpBoost = "(100%)";
                  else if (val === 2) xpBoost = "(133%)";
                  else if (val >= 3) xpBoost = "(166%)";
                  else xpBoost = "(25%)";
                }

                return (
                  <div key={skill} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white">{skill}</span>
                      <span className="text-green-500">Lvl {val} {xpBoost}</span>
                    </div>
                    <div className="h-1 bg-[#252830] rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${(val / 10) * 100}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-red-950/20 p-4 border border-red-900/30 flex-grow overflow-hidden flex flex-col">
            <h2 className="text-[10px] uppercase tracking-widest text-red-400 mb-2">Build Summary</h2>
            <div className="text-[11px] leading-relaxed text-[#808796] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-red-900/30">
               <p><span className="text-white uppercase tracking-wider text-[10px]">Occupation:</span> {selectedOccupation.name}</p>
           {currentTraits.sort((a,b) => a.type.localeCompare(b.type)).map(t => {
              const modifierText = t.modifiers ? Object.entries(t.modifiers).map(([k, v]) => `${(v as number) > 0 ? '+' : ''}${v} ${k}`).join(', ') : '';
              return (
                <div key={t.id} className="flex flex-col mb-2">
                  <span className={cn(
                    "font-semibold", 
                    t.type === 'positive' || t.type === 'occupation' ? "text-white" : "text-red-400"
                  )}>
                    {t.name}
                    {modifierText && <span className="text-amber-500 font-mono text-[9px] ml-2">[{modifierText}]</span>}
                  </span>
                  <span className="text-[10px]">{t.description} {t.effects}</span>
                </div>
              );
           })}
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer Info Bar */}
      <footer className="h-10 bg-[#0c0d10] border-t border-[#1f2228] flex items-center justify-between px-6 shrink-0 mt-auto fixed bottom-0 w-full z-50">
        <div className="flex items-center gap-4 text-[10px] text-[#424855] uppercase">
          <span>Version 42.16.1</span>
          <span>|</span>
          <span>Knox Event Protocol v3.0</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-[#424855]">
          <span>Character Presets: {loadouts.length} Saved</span>
        </div>
      </footer>
    </div>
  );
}

function TraitButton({ trait, isSelected, isExcluded, onClick }: { trait: Trait, isSelected: boolean, isExcluded: boolean, onClick: () => void }) {
  const modifierText = trait.modifiers ? Object.entries(trait.modifiers).map(([k, v]) => `${(v as number) > 0 ? '+' : ''}${v} ${k}`).join(', ') : '';

  return (
    <div
      onClick={!isExcluded ? onClick : undefined}
      className={cn(
        "p-2 border-y border-r border-l-2 flex justify-between items-start transition-all cursor-pointer group",
        isSelected 
          ? (trait.type === 'positive' 
              ? "bg-green-950/30 border-y-green-900/50 border-r-green-900/50 border-l-green-500 shadow-[inset_0_0_12px_rgba(20,83,45,0.1)]" 
              : "bg-red-950/30 border-y-red-900/50 border-r-red-900/50 border-l-red-500 shadow-[inset_0_0_12px_rgba(127,29,29,0.1)]")
          : isExcluded 
            ? "bg-[#0c0d10] border-[#1f2228] opacity-30 cursor-not-allowed" 
            : "bg-[#0c0d10] border-[#1f2228] hover:bg-[#14161b] hover:border-[#31363f] hover:border-l-[#5e636e]"
      )}
    >
      <div className="flex flex-col pr-3 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs transition-colors", 
            isSelected ? "text-white font-semibold" : "text-[#a0a5b0] group-hover:text-stone-300", 
            isExcluded && "line-through text-[#5e636e]"
          )}>
            {trait.name}
          </span>
        </div>
        
        <div className="flex flex-col mt-1 space-y-1">
          {(trait.description || trait.effects) && (
            <span className={cn(
              "text-[9px] leading-tight transition-colors",
              isSelected ? "text-[#808796]" : "text-[#5e636e] group-hover:text-[#808796]"
            )}>
              {trait.description} {trait.effects}
            </span>
          )}
          {modifierText && (
            <span className="text-[9px] font-mono text-amber-500/80">
              {modifierText}
            </span>
          )}
        </div>
      </div>
      <span className={cn("font-mono text-[10px] shrink-0", 
        trait.cost < 0 ? "text-green-500" : "text-red-500"
      )}>
        {trait.cost > 0 ? `+${trait.cost}` : trait.cost}
      </span>
    </div>
  );
}
