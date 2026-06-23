import React, { useState, useEffect } from 'react';
import { AppView, UserProfile, FoodAnalysis, SafetyLevel } from './types';
import { INITIAL_USER_PROFILE, NAV_ITEMS, COMMON_ALLERGENS, DIET_TYPES } from './constants';
import { analyzeFoodImage, getTravelTips } from './services/geminiService';
import CameraCapture from './components/CameraCapture';
import AnalysisView from './components/AnalysisView';
import { 
  Scan, Camera, Globe, User, ChevronRight, Settings, 
  MapPin, Shield, AlertTriangle, Loader2 
} from 'lucide-react';

const App = () => {
  const [view, setView] = useState<AppView>('ONBOARDING');
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysis | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [travelTips, setTravelTips] = useState<string>('');
  const [loadingTips, setLoadingTips] = useState(false);

  // --- Handlers ---

  const handleProfileUpdate = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const handleScan = async (base64: string) => {
    setIsAnalyzing(true);
    setCapturedImage(base64);
    setView('SCAN_FOOD'); // Keep overlay
    try {
      const result = await analyzeFoodImage(base64, userProfile);
      setAnalysisResult(result);
      setView('RESULTS');
    } catch (error) {
      alert("Failed to analyze food. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadTravelTips = async () => {
      setLoadingTips(true);
      const tips = await getTravelTips('Japan'); // Defaulting to Japan for demo, normally from Geolocation
      setTravelTips(tips);
      setLoadingTips(false);
  }

  // --- Views ---

  const renderOnboarding = () => (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col justify-end relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 animate-pulseSlow"></div>
      <div className="relative z-10 space-y-6 animate-slideUp">
        <div>
           <h1 className="text-5xl font-bold tracking-tighter mb-2">FOODLENS<span className="text-emerald-400">AI</span></h1>
           <p className="text-xl text-slate-300">Decode any dish. Eat safely anywhere.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4 shadow-xl">
          <h3 className="font-semibold text-lg">Quick Setup</h3>
          
          <div>
            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Dietary Preferences</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {['Vegan', 'Vegetarian', 'Halal', 'Gluten-Free'].map(diet => (
                <button 
                  key={diet}
                  onClick={() => {
                    const diets = userProfile.diets.includes(diet) 
                      ? userProfile.diets.filter(d => d !== diet)
                      : [...userProfile.diets, diet];
                    handleProfileUpdate({ diets });
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    userProfile.diets.includes(diet) 
                    ? 'bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/30 transform scale-105' 
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {diet}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={() => setView('DASHBOARD')}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/50 transition-all active:scale-95 animate-popIn delay-300"
        >
          Get Started <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="min-h-screen pb-24 bg-slate-50 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 pt-12 rounded-b-3xl shadow-sm border-b border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div className="animate-slideUp">
            <h2 className="text-slate-500 text-sm font-medium">Welcome back,</h2>
            <h1 className="text-2xl font-bold text-slate-900">{userProfile.name}</h1>
          </div>
          <button onClick={() => setView('PROFILE')} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Action */}
        <button 
          onClick={() => setView('SCAN_FOOD')}
          className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between group active:scale-95 transition-all animate-popIn delay-100"
        >
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
                <Scan className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-lg">Scan Food</span>
            </div>
            <p className="text-slate-400 text-sm">Instant ID, Allergens & Nutrition</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition">
             <Camera className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Suggested */}
      <div className="p-6 space-y-6">
        <div className="animate-slideUp delay-200">
            <div className="flex justify-between items-end mb-4">
                <h3 className="font-bold text-slate-800 text-lg">Explore Nearby</h3>
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1"><MapPin className="w-3 h-3"/> Tokyo</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {[
                    {name: 'Ramen', img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop'},
                    {name: 'Sushi', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop'},
                    {name: 'Tempura', img: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?q=80&w=800&auto=format&fit=crop'}
                ].map((item, i) => (
                    <div key={i} className="flex-shrink-0 w-36 h-48 rounded-xl overflow-hidden relative shadow-md transition-transform hover:scale-105" style={{animationDelay: `${i * 100}ms`}}>
                        <img src={item.img} className="w-full h-full object-cover" alt={item.name} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                            <span className="text-white font-medium">{item.name}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Safety Status */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3 animate-slideUp delay-300">
             <Shield className="w-5 h-5 text-emerald-600 mt-1" />
             <div>
                 <h4 className="font-bold text-emerald-900">Safety Filter Active</h4>
                 <p className="text-xs text-emerald-700/80 mt-1">
                    Screening for: {userProfile.allergies.length > 0 ? userProfile.allergies.join(', ') : 'No specific allergies'} 
                    {userProfile.diets.length > 0 && ` + ${userProfile.diets.join(', ')}`}
                 </p>
             </div>
        </div>
      </div>
    </div>
  );

  const renderTravelMode = () => (
      <div className="min-h-screen bg-slate-50 pb-24 p-6 pt-12 animate-fadeIn">
          <h1 className="text-2xl font-bold mb-6 animate-slideUp">Travel Companion</h1>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center space-y-4 animate-popIn delay-100">
              <Globe className="w-12 h-12 text-blue-500 mx-auto" />
              <h2 className="font-semibold text-lg">Where are you?</h2>
              <button 
                onClick={loadTravelTips} 
                className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium active:scale-95 transition"
                disabled={loadingTips}
              >
                  {loadingTips ? 'Loading...' : 'Load Japan Guide (Demo)'}
              </button>
          </div>
          
          {travelTips && (
              <div className="mt-6 prose prose-slate bg-white p-6 rounded-2xl shadow-sm animate-slideUp">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-slate-600">{travelTips}</pre>
              </div>
          )}
      </div>
  )

  const renderProfile = () => (
    <div className="min-h-screen bg-slate-50 pb-24 p-6 pt-12 animate-fadeIn">
        <h1 className="text-2xl font-bold mb-6 animate-slideUp">Your Preferences</h1>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6 animate-slideUp delay-100">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">My Allergies</label>
                <div className="flex flex-wrap gap-2">
                    {COMMON_ALLERGENS.map(allergen => (
                        <button
                            key={allergen}
                            onClick={() => {
                                const allergies = userProfile.allergies.includes(allergen)
                                    ? userProfile.allergies.filter(a => a !== allergen)
                                    : [...userProfile.allergies, allergen];
                                handleProfileUpdate({ allergies });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-sm border transition-all active:scale-95 ${
                                userProfile.allergies.includes(allergen)
                                ? 'bg-red-50 border-red-200 text-red-600 font-medium'
                                : 'bg-white border-slate-200 text-slate-500'
                            }`}
                        >
                            {allergen}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">My Diet</label>
                <div className="flex flex-wrap gap-2">
                    {DIET_TYPES.map(diet => (
                        <button
                            key={diet}
                            onClick={() => {
                                const diets = userProfile.diets.includes(diet)
                                    ? userProfile.diets.filter(d => d !== diet)
                                    : [...userProfile.diets, diet];
                                handleProfileUpdate({ diets });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-sm border transition-all active:scale-95 ${
                                userProfile.diets.includes(diet)
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600 font-medium'
                                : 'bg-white border-slate-200 text-slate-500'
                            }`}
                        >
                            {diet}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen relative shadow-2xl overflow-hidden">
      {/* View Router */}
      {view === 'ONBOARDING' && renderOnboarding()}
      {view === 'DASHBOARD' && renderDashboard()}
      {view === 'TRAVEL_MODE' && renderTravelMode()}
      {view === 'PROFILE' && renderProfile()}
      
      {/* Overlays */}
      {view === 'SCAN_FOOD' && (
        <CameraCapture 
            onCapture={handleScan} 
            onClose={() => setView('DASHBOARD')} 
        />
      )}
      
      {view === 'RESULTS' && analysisResult && (
        <AnalysisView 
            data={analysisResult} 
            image={capturedImage}
            onClose={() => {
                setAnalysisResult(null);
                setCapturedImage(null);
                setView('DASHBOARD');
            }} 
        />
      )}

      {/* Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center animate-fadeIn">
            <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
            <h2 className="text-xl font-bold mb-2">Analyzing Food...</h2>
            <p className="text-slate-300">Checking allergens, calculating nutrition, and finding cultural facts.</p>
        </div>
      )}

      {/* Bottom Navigation */}
      {view !== 'ONBOARDING' && view !== 'SCAN_FOOD' && view !== 'RESULTS' && !isAnalyzing && (
        <nav className="fixed bottom-0 right-0 left-0 w-full bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-40 max-w-md mx-auto safe-area-bottom animate-slideUp delay-200">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as AppView)}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default App;