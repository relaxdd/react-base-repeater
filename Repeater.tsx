import React, { useState } from 'react';
import style from "./Repeater.module.scss";
import ItemRepeater, { RepeatActions, RepeaterReducer } from "./ItemRepeater";
import { SomeObject } from "types";
import useDidUpdateEffect from "hooks/useDidUpdateEffect";
import CompareData from "class/CompareData";

type Dispatch<T> = (key: keyof T, value: any, index: number) => void
type BaseTypes = "string" | "repeater";
type ListOfTypes<T = SomeObject> = { [key in keyof T]: BaseTypes; };

interface RepeaterProps<T extends SomeObject> {
  title?: string;
  data: Array<T>;
  onChange?: (qty: number) => void;
  render: (state: [T, Dispatch<T>], i: number) => JSX.Element | JSX.Element[];
  baseKeys: (keyof T)[];
  baseTypes?: ListOfTypes<T>;
  isSubRepeat?: boolean;
}

/**
 * @deprecated
 * @param title
 * @param data
 * @param onChange
 * @param baseKeys
 * @param baseTypes
 * @param render
 * @param isSubRepeat
 * @constructor
 */
function Repeater<T extends SomeObject>(
  { title, data, onChange, baseKeys, baseTypes, render, isSubRepeat }: RepeaterProps<T>,
) {
  isSubRepeat = typeof isSubRepeat !== "undefined" ? isSubRepeat : false;
  data = typeof data !== "undefined" ? data : [];

  const [state, setState] = useState<T[]>(data);
  const [loop, setLoop] = useState(false);
  const keys = data.length ? Object.keys(data![0]) as (keyof T)[] : baseKeys;

  // FIXME: Разобраться с багом, почему то перерисовывает при отрабатывании callback

  // Сохранение данных при перерисовке...
  // useEffect(() => {
  //   return () => {
  //     console.log("unmount");
  //   };
  // }, []);

  // Внешнее обновление данных
  useDidUpdateEffect(() => {
    // console.log(isSubRepeat, "data");
    if (loop || CompareData.isEquals(state, data)) return;
    setState(data);
  }, [data]);

  // Внутреннее обновление данных
  useDidUpdateEffect(() => {
    // console.log(isSubRepeat, "state");
    setLoop(true);
    onChange && onChange(state.length);
    setTimeout(() => setLoop(false), 0);
  }, [state]);

  /* methods */

  /**
   * Перезаписывает состояние повторителя по указанным параметрам
   *
   * @param key
   * @param value
   * @param index
   */
  function dispatch(key: keyof T, value: string, index: number) {
    setState((prev) => prev.map((item, i) => {
      return i !== index ? item : {
        ...item,
        [key]: value,
      };
    }));
  }

  const setter = <T extends {}, K extends keyof T>(
    obj: T, prop: K, val: T[K],
  ): void => {
    obj[prop] = val;
  };

  function allStrings() {
    return keys.reduce((acc, key) => {
      acc[key] = "string";
      return acc;
    }, {} as ListOfTypes<T>);
  }

  /**
   * Создает новый элемент повторителя
   */
  function create(): T {
    const item = {} as T;
    const types = typeof baseTypes === "undefined" ? allStrings() : baseTypes;

    keys.forEach((key) => {
      const value = types[key] === "string" ? "" : [];
      setter(item, key, value as unknown as T[keyof T]);
    });

    return item;
  }

  /**
   * Добавляет новый элемент повторителя в конец
   */
  function push() {
    setState((prev) => [...prev, create()]);
  }

  /**
   * Удаляет элемент повторителя по индексу
   * @param index
   */
  function remove(index: number) {
    const isEmpty = Object.keys(state[index]).every((key) => {
      const value = state[index][key as keyof T];
      return value === "" as unknown as T[keyof T] || value === false as unknown as T[keyof T];
    });

    const __helper = () => {
      setState((prev) => {
        return prev.filter((_, i) => i !== index);
      });
    };

    if (isEmpty) __helper();
    else {
      const result = window.confirm("Вы действительно хотите удалить этот элемент?");
      if (result) __helper();
    }
  }

  /**
   * Добавляет новый элемент повторителя по указанному индексу
   * @param index
   */
  function add(index: number) {
    setState((prev) => {
      const start = prev.slice(0, index);
      const finish = prev.slice(index, prev.length);
      const item = create();

      return [...start, item, ...finish];
    });
  }

  /**
   * Набор некоторых действий с указанием индекса элемента повторителя
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
        {state.map((item, i) => {
          return (
            <ItemRepeater key={i} index={i} reducer={reducer}>
              {render([state[i], dispatch], i)}
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

export default Repeater;
