import React, { forwardRef } from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

const ResizablePanelGroup = forwardRef(({ 
  className,
  direction = 'horizontal',
  children,
  ...props 
}, ref) => {
  return (
    <ResizableProvider direction={direction}>
      <div
        ref={ref}
        className={cn(
          "flex h-full w-full",
          direction === 'horizontal' ? 'flex-row' : 'flex-col',
          className
        )}
        data-panel-group=""
        data-direction={direction}
        {...props}
      >
        {children}
      </div>
    </ResizableProvider>
  );
});

ResizablePanelGroup.displayName = "ResizablePanelGroup";

const ResizableContext = React.createContext();

const ResizableProvider = ({ children, direction }) => {
  const [panels, setPanels] = React.useState(new Map());
  const [isResizing, setIsResizing] = React.useState(false);

  const registerPanel = React.useCallback((id, initialSize) => {
    setPanels(prev => new Map(prev.set(id, { size: initialSize, minSize: 0, maxSize: 100 })));
  }, []);

  const updatePanelSize = React.useCallback((id, size) => {
    setPanels(prev => {
      const newPanels = new Map(prev);
      const panel = newPanels.get(id);
      if (panel) {
        newPanels.set(id, { ...panel, size });
      }
      return newPanels;
    });
  }, []);

  const updatePanelConstraints = React.useCallback((id, minSize, maxSize) => {
    setPanels(prev => {
      const newPanels = new Map(prev);
      const panel = newPanels.get(id);
      if (panel) {
        newPanels.set(id, { ...panel, minSize, maxSize });
      }
      return newPanels;
    });
  }, []);

  return (
    <ResizableContext.Provider value={{
      direction,
      panels,
      isResizing,
      setIsResizing,
      registerPanel,
      updatePanelSize,
      updatePanelConstraints
    }}>
      {children}
    </ResizableContext.Provider>
  );
};

const useResizable = () => {
  const context = React.useContext(ResizableContext);
  if (!context) {
    throw new Error('useResizable must be used within ResizablePanelGroup');
  }
  return context;
};

const ResizablePanel = forwardRef(({ 
  className,
  defaultSize = 50,
  minSize = 0,
  maxSize = 100,
  id,
  children,
  ...props 
}, ref) => {
  const { direction, panels, registerPanel, updatePanelConstraints } = useResizable();
  const panelId = id || React.useId();

  React.useEffect(() => {
    registerPanel(panelId, defaultSize);
    updatePanelConstraints(panelId, minSize, maxSize);
  }, [panelId, defaultSize, minSize, maxSize, registerPanel, updatePanelConstraints]);

  const panel = panels.get(panelId);
  const size = panel?.size || defaultSize;

  const style = {
    [direction === 'horizontal' ? 'width' : 'height']: `${size}%`,
    flexShrink: 0,
    flexGrow: 0
  };

  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      style={style}
      data-panel=""
      data-panel-id={panelId}
      {...props}
    >
      {children}
    </div>
  );
});

ResizablePanel.displayName = "ResizablePanel";

const ResizableHandle = forwardRef(({ 
  className,
  withHandle = true,
  ...props 
}, ref) => {
  const { direction, isResizing, setIsResizing, panels, updatePanelSize } = useResizable();
  const [isDragging, setIsDragging] = React.useState(false);
  const handleRef = React.useRef(null);

  React.useImperativeHandle(ref, () => handleRef.current);

  const handleMouseDown = React.useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    setIsResizing(true);

    const startPos = direction === 'horizontal' ? e.clientX : e.clientY;
    const panelGroup = handleRef.current?.closest('[data-panel-group]');
    
    if (!panelGroup) return;

    const panelElements = Array.from(panelGroup.querySelectorAll('[data-panel]'));
    const handleIndex = Array.from(panelGroup.children).indexOf(handleRef.current);
    const leftPanel = panelElements[Math.floor(handleIndex / 2)];
    const rightPanel = panelElements[Math.floor(handleIndex / 2) + 1];

    if (!leftPanel || !rightPanel) return;

    const leftPanelId = leftPanel.dataset.panelId;
    const rightPanelId = rightPanel.dataset.panelId;
    const leftPanelData = panels.get(leftPanelId);
    const rightPanelData = panels.get(rightPanelId);

    if (!leftPanelData || !rightPanelData) return;

    const groupRect = panelGroup.getBoundingClientRect();
    const groupSize = direction === 'horizontal' ? groupRect.width : groupRect.height;

    const handleMouseMove = (e) => {
      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
      const delta = currentPos - startPos;
      const deltaPercent = (delta / groupSize) * 100;

      const newLeftSize = Math.max(
        leftPanelData.minSize,
        Math.min(leftPanelData.maxSize, leftPanelData.size + deltaPercent)
      );
      const newRightSize = Math.max(
        rightPanelData.minSize,
        Math.min(rightPanelData.maxSize, rightPanelData.size - deltaPercent)
      );

      // Only update if both panels can accommodate the change
      if (newLeftSize !== leftPanelData.size && newRightSize !== rightPanelData.size) {
        updatePanelSize(leftPanelId, newLeftSize);
        updatePanelSize(rightPanelId, newRightSize);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [direction, panels, updatePanelSize, setIsResizing]);

  return (
    <div
      ref={handleRef}
      className={cn(
        "relative flex shrink-0 items-center justify-center bg-border",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:cursor-row-resize",
        "data-[panel-group-direction=horizontal]:h-full data-[panel-group-direction=horizontal]:w-px data-[panel-group-direction=horizontal]:cursor-col-resize",
        direction === 'horizontal' ? 'w-px h-full cursor-col-resize' : 'h-px w-full cursor-row-resize',
        isDragging && "bg-accent",
        className
      )}
      data-panel-resize-handle=""
      data-direction={direction}
      onMouseDown={handleMouseDown}
      {...props}
    >
      {withHandle && (
        <div className={cn(
          "z-10 flex items-center justify-center rounded-sm border bg-border",
          direction === 'horizontal' 
            ? "h-4 w-3 translate-x-[-1px]" 
            : "h-3 w-4 translate-y-[-1px]"
        )}>
          <GripVertical className={cn(
            "h-2.5 w-2.5",
            direction === 'vertical' && "rotate-90"
          )} />
        </div>
      )}
    </div>
  );
});

ResizableHandle.displayName = "ResizableHandle";

// Predefined resizable layouts
export const ResizableVariants = {
  // Two-panel layout
  TwoPanel: forwardRef(({ 
    direction = 'horizontal',
    defaultSizes = [50, 50],
    leftPanel,
    rightPanel,
    className,
    ...props 
  }, ref) => (
    <ResizablePanelGroup
      ref={ref}
      direction={direction}
      className={className}
      {...props}
    >
      <ResizablePanel defaultSize={defaultSizes[0]}>
        {leftPanel}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={defaultSizes[1]}>
        {rightPanel}
      </ResizablePanel>
    </ResizablePanelGroup>
  )),

  // Three-panel layout
  ThreePanel: forwardRef(({ 
    direction = 'horizontal',
    defaultSizes = [25, 50, 25],
    leftPanel,
    centerPanel,
    rightPanel,
    className,
    ...props 
  }, ref) => (
    <ResizablePanelGroup
      ref={ref}
      direction={direction}
      className={className}
      {...props}
    >
      <ResizablePanel defaultSize={defaultSizes[0]}>
        {leftPanel}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={defaultSizes[1]}>
        {centerPanel}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={defaultSizes[2]}>
        {rightPanel}
      </ResizablePanel>
    </ResizablePanelGroup>
  )),

  // Sidebar layout
  Sidebar: forwardRef(({ 
    sidebarContent,
    mainContent,
    sidebarDefaultSize = 20,
    sidebarMinSize = 15,
    sidebarMaxSize = 40,
    side = 'left',
    className,
    ...props 
  }, ref) => (
    <ResizablePanelGroup
      ref={ref}
      direction="horizontal"
      className={className}
      {...props}
    >
      {side === 'left' && (
        <>
          <ResizablePanel 
            defaultSize={sidebarDefaultSize}
            minSize={sidebarMinSize}
            maxSize={sidebarMaxSize}
          >
            {sidebarContent}
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={100 - sidebarDefaultSize}>
            {mainContent}
          </ResizablePanel>
        </>
      )}
      {side === 'right' && (
        <>
          <ResizablePanel defaultSize={100 - sidebarDefaultSize}>
            {mainContent}
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel 
            defaultSize={sidebarDefaultSize}
            minSize={sidebarMinSize}
            maxSize={sidebarMaxSize}
          >
            {sidebarContent}
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  ))
};

// Hook for resizable state management
export const useResizableState = (initialSizes = []) => {
  const [sizes, setSizes] = React.useState(initialSizes);

  const updateSize = React.useCallback((index, size) => {
    setSizes(prev => {
      const newSizes = [...prev];
      newSizes[index] = size;
      return newSizes;
    });
  }, []);

  const resetSizes = React.useCallback(() => {
    setSizes(initialSizes);
  }, [initialSizes]);

  return {
    sizes,
    setSizes,
    updateSize,
    resetSizes
  };
};

// Hook for panel constraints
export const usePanelConstraints = (minSize = 0, maxSize = 100) => {
  const [constraints, setConstraints] = React.useState({ minSize, maxSize });

  const updateConstraints = React.useCallback((newMinSize, newMaxSize) => {
    setConstraints({
      minSize: newMinSize ?? constraints.minSize,
      maxSize: newMaxSize ?? constraints.maxSize
    });
  }, [constraints]);

  return {
    constraints,
    updateConstraints
  };
};

// Simple resizable component for quick use
export const SimpleResizable = ({ 
  panels = [], 
  direction = 'horizontal',
  ...props 
}) => {
  return (
    <ResizablePanelGroup direction={direction} {...props}>
      {panels.map((panel, index) => (
        <React.Fragment key={index}>
          <ResizablePanel
            defaultSize={panel.defaultSize || 100 / panels.length}
            minSize={panel.minSize}
            maxSize={panel.maxSize}
          >
            {panel.content}
          </ResizablePanel>
          {index < panels.length - 1 && <ResizableHandle />}
        </React.Fragment>
      ))}
    </ResizablePanelGroup>
  );
};

export {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
};

export default ResizablePanelGroup;