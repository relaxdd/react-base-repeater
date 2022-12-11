import { Arrayable } from "../../index";
import scss from "./ItemRepeater.module.scss";
import { useEffect, useRef, useState } from "react";

export enum RepeatActions {
  ADD = "add",
  REMOVE = "remove",
}

export type RepeaterReducer = (action: RepeatActions, index: number) => void;

interface Props {
  index: number;
  reducer: RepeaterReducer;
  children: Arrayable<JSX.Element>;
}

function ItemRepeater({ children, index, reducer }: Props) {
  const [isHide, setHide] = useState(false);
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
  }, [isHide]);

  return (
    <div className={`${scss.root}${rootClass}`} ref={rootRef}>
      <div className={scss.left} data-role={"left"}>
        <span className={scss.count}>{index + 1}</span>
        <span className={scss.hide} onClick={() => setHide(!isHide)}>
          <i className="fa-solid fa-caret-up"></i>
        </span>
      </div>
      <div className={scss.field} data-role={"field"}>{children}</div>
      <div className={scss.right} data-role={"right"}>
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
