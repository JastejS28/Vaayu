// Monitor for initial UAV position set
  useEffect(() => {
    const unsubscribe = useUAVStore.subscribe(
      (state) => state.position,
      (position) => {
        // When position changes from default, mark initial spawn as complete
        const isAtDefault = Math.abs(position[0]) < 0.1 && 
                           Math.abs(position[1] - 50) < 0.1 && 
                           Math.abs(position[2]) < 0.1;
        if (!isAtDefault) {
          setIsInitialSpawn(false);
        }
      }
    );
  }
  )