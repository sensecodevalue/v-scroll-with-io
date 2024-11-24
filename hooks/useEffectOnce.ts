import { EffectCallback, DependencyList, useEffect, useRef } from "react";

export default function useEffectOnce(
  effect: EffectCallback,
  dependencyList: DependencyList = [],
  when: boolean = true
) {
  const isExecuted = useRef(false);

  useEffect(() => {
    if (isExecuted.current || !when) return;

    effect();
    isExecuted.current = true;
  }, [effect, when, ...dependencyList]);
}
