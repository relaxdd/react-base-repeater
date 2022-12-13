import { useEffect, useRef, useState } from "react";
import scss from "./scss/ItemRepeater.module.scss";
import useDidUpdateEffect from "./hooks/useDidUpdateEffect";
import { Arrayable } from "./types";

export enum RepeatActions {
  ADD = "add",
  REMOVE = "remove",
}

export type RepeaterReducer = (action: RepeatActions, index: number) => void;
export type OnHideItemRepeater = (index: number, isHidden: boolean, isInitial: boolean) => void

interface Props {
  index: number;
  reducer: RepeaterReducer;
  children: Arrayable<JSX.Element>;
  onHide?: OnHideItemRepeater;
  isHidden?: boolean;
}

function ItemRepeater({ children, index, reducer, onHide, isHidden }: Props) {
  const [isHide, setHide] = useState(isHidden || false);
  const rootClass = isHide ? " " + scss.hidden : "";
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    const root = rootRef.current as HTMLDivElement;

    if (!isHide)
      root.removeAttribute("style");
    else {
      const field = rootRef.current.childNodes.item(1);
      const height = (field.childNodes.item(0) as HTMLDivElement).clientHeight;

      root.style.maxHeight = (height + 21) + "px";
    }

    onHide && onHide(index, isHide, true);
  }, [isHide]);

  useDidUpdateEffect(() => {
    onHide && onHide(index, isHide, false);
  }, [isHide]);

  return (
    <div className={`${scss.root}${rootClass}`} ref={rootRef}>
      <div className={scss.left}>
        <span className={scss.count}>{index + 1}</span>
        <span className={scss.hide} onClick={() => setHide(!isHide)}>
          <i className="fa-solid fa-caret-up"></i>
        </span>
      </div>
      <div className={scss.field}>{children}</div>
      <div className={scss.right}>
        <span
          className={scss.right_plus}
          title="Добавить"
          onClick={() => reducer(RepeatActions.ADD, index)}
        >
          <i className="fa-solid fa-plus"></i>
        </span>
        <span
          className={scss.right_minus}
          title="Удалить"
          onClick={() => reducer(RepeatActions.REMOVE, index)}
        >
          <i className="fa-solid fa-minus"></i>
        </span>
      </div>
    </div>
  );
};

export default ItemRepeater;
