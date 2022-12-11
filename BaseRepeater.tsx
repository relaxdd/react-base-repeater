import style from "./Repeater.module.scss";
import ItemRepeater, { RepeatActions, RepeaterReducer } from "./ItemRepeater";
import { SomeObject } from "types";

type RepeaterDispatch<T> = (key: keyof T, value: any, index: number) => void

interface BaseRepeaterProps<T> {
  title?: string;
  data: Array<T>;
  onChange: (list: T[]) => void;
  render: (state: [T, RepeaterDispatch<T>], i: number) => JSX.Element | JSX.Element[];
  // TODO: Переписать тип
  baseKeys: (keyof T)[];
  textConfirmDeleteItem?: string;
}

function BaseRepeater<T extends SomeObject<string>>(
  { title, data, onChange, baseKeys, textConfirmDeleteItem, render }: BaseRepeaterProps<T>,
) {
  /**
   * Overwrites the state at the specified index
   *
   * @param key
   * @param value
   * @param index
   */
  function onEdit(key: keyof T, value: string, index: number) {
    onChange(data.map((item, i) => {
      return i !== index ? item : { ...item, [key]: value };
    }));
  }

  /**
   * Creates a new element
   */
  function create(): T {
    return baseKeys.reduce((obj, key) => {
      obj[key] = "" as T[keyof T];
      return obj;
    }, {} as T);
  }

  /**
   * Checks if the element is empty
   * @param index Индекс элемента
   */
  function isFieldEmpty(index: number): boolean {
    return Object.keys(data[index]).every((key) => {
      return data[index][key] === "";
    });
  }

  /**
   * Добавляет новый элемент повторителя в конец
   */
  function push() {
    onChange([...data, create()]);
  }

  /**
   * Deletes an item by index
   * @param index
   */
  function remove(index: number) {
    const __delete = () => {
      onChange(data.filter((_, i) => i !== index));
    };

    if (isFieldEmpty(index)) __delete();
    else {
      const text = textConfirmDeleteItem || "Do you really want to delete this item?";
      const result = window.confirm(text);
      if (result) __delete();
    }
  }

  /**
   * Adds a new element at the specified index
   * @param index
   */
  function add(index: number) {
    onChange([
      ...data.slice(0, index),
      create(),
      ...data.slice(index, data.length),
    ]);
  }

  /**
   * A set of some actions specifying the index of the element
   *
   * @param action
   * @param index
   */
  const reducer: RepeaterReducer = (action, index) => {
    switch (action) {
      case RepeatActions.ADD:
        add(index);
        break;
      case RepeatActions.REMOVE:
        remove(index);
        break;
    }
  };

  return (
    <div className={style.wrapper}>
      {typeof title !== "undefined" && (
        <div>
          <label className={"form-label"}>{title}</label>
        </div>
      )}
      <div className={style.header}>
        <div className={style.inner}></div>
        <div className={style.inner}>
          Данные <span className={style.required}>*</span>
        </div>
        <div className={style.inner}></div>
      </div>
      <div className={style.elements}>
        {data.map((item, i) => {
          return (
            <ItemRepeater key={i} index={i} reducer={reducer}>
              {render([data[i], onEdit], i)}
            </ItemRepeater>
          );
        })}
      </div>

      <div className={style.button} onClick={push}>
        <button className="btn btn-outline-secondary" type="button">Добавить</button>
      </div>
    </div>
  );
}

export default BaseRepeater;
