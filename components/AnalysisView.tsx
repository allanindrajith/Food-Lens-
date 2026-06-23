import React, { useState } from 'react';
import { FoodAnalysis, SafetyLevel, Recipe } from '../types';
import { 
  AlertTriangle, CheckCircle, Flame, Droplet, Wheat, 
  MapPin, Info, ChefHat, Share2, ChevronDown, ChevronUp,
  Heart
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { generateRecipe } from '../services/geminiService';

interface AnalysisViewProps {
  data: FoodAnalysis;
  image: string | null;
  onClose: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ data, image, onClose }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'NUTRITION' | 'CULTURE'>('OVERVIEW');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  const getSafetyColor = (level: SafetyLevel) => {
    switch (level) {
      case SafetyLevel.SAFE: return 'bg-emerald-500 text-white';
      case SafetyLevel.CAUTION: return 'bg-yellow-500 text-white';
      case SafetyLevel.DANGER: return 'bg-red-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSafetyIcon = (level: SafetyLevel) => {
    switch (level) {
      case SafetyLevel.SAFE: return <CheckCircle className="w-5 h-5" />;
      case SafetyLevel.CAUTION: return <AlertTriangle className="w-5 h-5" />;
      case SafetyLevel.DANGER: return <AlertTriangle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const handleGenerateRecipe = async () => {
    setLoadingRecipe(true);
    setShowRecipeModal(true);
    try {
      const res = await generateRecipe(data.dishName);
      setRecipe(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRecipe(false);
    }
  };

  const handleShare = async () => {
    const shareData: ShareData = {
        title: `FoodLens AI: ${data.dishName}`,
        text: `Check out this ${data.dishName} from ${data.countryOfOrigin}! Analyzed with FoodLens AI.`,
        url: window.location.href
    };

    if (navigator.share) {
        try {
            if (image) {
                // Convert base64 to blob/file
                try {
                    const res = await fetch(`data:image/jpeg;base64,${image}`);
                    const blob = await res.blob();
                    const file = new File([blob], 'food-scan.jpg', { type: 'image/jpeg' });
                    
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        shareData.files = [file];
                    }
                } catch (e) {
                    console.warn("Could not prepare image for sharing:", e);
                }
            }
            await navigator.share(shareData);
        } catch (error) {
            console.log('Share canceled or failed:', error);
        }
    } else {
        // Fallback
        try {
             await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
             alert("Details copied to clipboard!");
        } catch (err) {
            alert("Sharing is not supported on this device.");
        }
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Safety Banner */}
      <div className={`p-4 rounded-xl flex items-start gap-3 shadow-sm ${getSafetyColor(data.safetyAssessment.level)} animate-popIn`}>
        <div className="mt-0.5">{getSafetyIcon(data.safetyAssessment.level)}</div>
        <div>
          <h3 className="font-bold text-lg">{data.safetyAssessment.level} TO EAT</h3>
          <p className="text-sm opacity-90">{data.safetyAssessment.reason}</p>
        </div>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-2 gap-4 animate-slideUp delay-100">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <span className="text-xs text-slate-500 uppercase font-semibold">Origin</span>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-slate-900">{data.countryOfOrigin}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <span className="text-xs text-slate-500 uppercase font-semibold">Taste</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.tasteProfile.slice(0, 2).map(t => (
               <span key={t} className="text-sm font-medium text-slate-900">{t},</span>
            ))}
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-slideUp delay-200">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Ingredients Detected</h3>
        </div>
        <div className="p-4">
          <ul className="space-y-2">
            {data.ingredients.map((ing, idx) => (
              <li key={idx} className="flex justify-between items-center text-sm">
                <span className="text-slate-700">{ing.name}</span>
                <div className="flex items-center gap-2">
                   {ing.isAllergen && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Allergen</span>}
                   <span className="text-slate-400 text-xs">{(ing.confidence * 100).toFixed(0)}%</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Badges */}
      <div className="flex flex-wrap gap-2 animate-slideUp delay-300">
        {data.suitability.map(tag => (
          <span key={tag} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );

  const renderNutrition = () => {
    const nutritionData = [
      { name: 'Protein', value: parseFloat(data.nutrition.protein), color: '#34d399' }, // emerald-400
      { name: 'Carbs', value: parseFloat(data.nutrition.carbs), color: '#fbbf24' },   // amber-400
      { name: 'Fat', value: parseFloat(data.nutrition.fat), color: '#f87171' },     // red-400
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center animate-popIn">
            <h3 className="text-3xl font-bold text-slate-800">{data.nutrition.calories}</h3>
            <span className="text-slate-500 text-sm">Calories / Serving</span>
            
            <div className="h-48 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nutritionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {nutritionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center gap-6 w-full mt-4 animate-slideUp delay-100">
                {nutritionData.map(item => (
                    <div key={item.name} className="text-center">
                        <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{backgroundColor: item.color}}></div>
                        <span className="block text-xs text-slate-500 uppercase">{item.name}</span>
                        <span className="block font-semibold text-slate-800">{data.nutrition[item.name.toLowerCase() as keyof typeof data.nutrition]}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  };

  const renderCulture = () => (
     <div className="space-y-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 animate-slideUp">
            <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500"/> Cultural Significance
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
                {data.culturalNotes}
            </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 animate-slideUp delay-100">
            <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-500"/> How to Eat
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
                {data.eatingEtiquette}
            </p>
        </div>

        <div className="space-y-2 animate-slideUp delay-200">
            <h3 className="text-sm font-semibold text-slate-500 uppercase ml-1">Similar Dishes</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {data.similarDishes.map((dish, idx) => (
                    <div key={idx} className="flex-shrink-0 bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-sm text-sm text-slate-700 font-medium">
                        {dish}
                    </div>
                ))}
            </div>
        </div>
     </div>
  );

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto max-w-md mx-auto bg-slate-50 animate-slideUp">
      {/* Header Image */}
      <div className="h-64 bg-slate-900 relative overflow-hidden">
        {image ? (
            <img 
                src={`data:image/jpeg;base64,${image}`} 
                alt={data.dishName} 
                className="absolute inset-0 w-full h-full object-cover opacity-90 animate-fadeIn"
            />
        ) : (
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90"></div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
        
        <button 
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/30 text-white backdrop-blur hover:bg-black/50 transition-colors"
        >
            <ChevronDown className="w-6 h-6" />
        </button>
        
        <div className="absolute bottom-0 left-0 w-full p-6 animate-slideUp delay-100">
            <h1 className="text-3xl font-bold text-white mb-1 drop-shadow-md">{data.dishName}</h1>
            <p className="text-slate-300 italic text-lg drop-shadow-sm">{data.localName}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 bg-white shadow-sm z-30 px-6 flex justify-between border-b border-slate-100">
        {(['OVERVIEW', 'NUTRITION', 'CULTURE'] as const).map(tab => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === tab ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400'
                }`}
            >
                {tab}
            </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 pb-24 max-w-lg mx-auto">
        {activeTab === 'OVERVIEW' && renderOverview()}
        {activeTab === 'NUTRITION' && renderNutrition()}
        {activeTab === 'CULTURE' && renderCulture()}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-slate-200 p-4 flex gap-3 z-50 safe-area-bottom max-w-md mx-auto animate-slideUp delay-300">
        <button 
            onClick={handleGenerateRecipe}
            className="flex-1 bg-emerald-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-emerald-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
            <ChefHat className="w-5 h-5" /> Make This
        </button>
        <button 
            onClick={handleShare}
            className="p-3.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors active:scale-95"
            aria-label="Share to socials"
        >
            <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Recipe Modal */}
      {showRecipeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fadeIn max-w-md mx-auto">
            <div className="bg-white w-full sm:w-[500px] h-[90vh] sm:h-auto sm:rounded-2xl rounded-t-3xl p-6 overflow-y-auto relative animate-slideUp">
                <button 
                    onClick={() => setShowRecipeModal(false)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
                >
                    <X className="w-6 h-6" />
                </button>

                {loadingRecipe ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium">Chef AI is writing your recipe...</p>
                    </div>
                ) : recipe ? (
                    <div className="space-y-6">
                         <div>
                            <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-wide">
                                {recipe.difficulty}
                            </span>
                             <h2 className="text-2xl font-bold text-slate-900 mt-2">{recipe.title}</h2>
                             <p className="text-slate-500 flex items-center gap-2 mt-1">
                                <Flame className="w-4 h-4" /> {recipe.cookTime}
                             </p>
                         </div>

                         <div>
                             <h3 className="font-semibold text-slate-800 mb-3">Ingredients</h3>
                             <ul className="space-y-2">
                                 {recipe.ingredients.map((ing, i) => (
                                     <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5"></div>
                                         {ing}
                                     </li>
                                 ))}
                             </ul>
                         </div>

                         <div>
                             <h3 className="font-semibold text-slate-800 mb-3">Instructions</h3>
                             <div className="space-y-4">
                                 {recipe.steps.map((step, i) => (
                                     <div key={i} className="flex gap-4">
                                         <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center mt-0.5">
                                             {i + 1}
                                         </span>
                                         <p className="text-slate-600 text-sm leading-relaxed">{step}</p>
                                     </div>
                                 ))}
                             </div>
                         </div>
                    </div>
                ) : (
                    <p className="text-center text-red-500">Failed to load recipe.</p>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

// Simple Icon component used inside AnalysisView
import { Utensils, Globe, X } from 'lucide-react';

export default AnalysisView;