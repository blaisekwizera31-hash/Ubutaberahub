import React from "react";
// Make sure this path matches where you saved the logo
import Logo from "../assets/logo.png"; 

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[9999]">
      <div className="relative">
        {/* Soft glow behind the logo */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl animate-pulse" />
        
        {/* Your Transparent Logo */}
        <img 
          src={Logo} 
          alt="UBUTABERA Logo" 
          className="w-40 h-40 object-contain relative animate-bounce-slow"
        />
      </div>

      {/* Progress Bar Container */}
      <div className="mt-10 w-64 h-1.5 bg-muted rounded-full overflow-hidden">
        {/* Animated Progress Fill */}
        <div className="h-full bg-primary animate-loading-bar origin-left" />
      </div>

      <div className="mt-4 flex flex-col items-center gap-1">
        <h2 className="text-xl font-bold tracking-wider">
          UBUTABERA<span className="text-primary">hub</span>
        </h2>
        <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] animate-pulse">
          Loading Security...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;