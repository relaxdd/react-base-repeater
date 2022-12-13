import scss from "./scss/Repeater.module.scss";
import ItemRepeater, { OnHideItemRepeater, RepeatActions, RepeaterReducer } from "./ItemRepeater";
import { SomeObject } from "./types";
import { removeElementByKey } from "./utils";
import { useEffect } from "react";
import CompareData from "./class/CompareData";

type RepeaterDispatch<T> = (key: keyof T, value: any, index: number) => void
type BaseTypes = "string" | "boolean" | "array";
type AllowedTypes = string | boolean | any[];
type ListOfTypes<T = SomeObject> = { [key in keyof T]: BaseTypes; };

interface BaseRepeaterProps<T> {
  data: Array<T>;
  baseKeys: (keyof T)[];
  onChange: (list: T[]) => void;
  onRender: (state: [T, RepeaterDispatch<T>], i: number) => JSX.Element | JSX.Element[];
  title?: string;
  onHideItem?: OnHideItemRepeater;
  onMount?: () => void;
  textConfirmDeleteItem?: string;
  id?: string;
  baseTypes?: ListOfTypes<T>;
}

// TODO: Сделать проверку на кол-во элементов и если 1 то не покалывать скрывашку
function BaseRepeater<T extends Object>(
  {
    title,
    data,
    baseKeys,
    onChange,
    textConfirmDeleteItem,
    onRender,
    onHideItem,
    id,
    baseTypes,
    onMount,
  }: BaseRepeaterProps<T>,
) {
  const ls = "__osvetilo_admin_hidden";
  const hidden = getDataOfHidden() || [];

  useEffect(() => {
    onMount && onMount();
  }, []);

  function defaultTypes() {
    return baseKeys.reduce((acc, key) => {
      acc[key] = "string";
      return acc;
    }, {} as ListOfTypes<T>);
  }

  /**
   * Возвращает значение по умолчанию для конкретно типа данных
   * @param type
   */
  function getDefaultValue(type: BaseTypes): AllowedTypes {
    switch (type) {
      case "string":
        return "";
      case "boolean":
        return false;
      case "array":
        return [];
    }
  }

  /**
   * Получить данные о скрытых полях, так же чистит local storage
   */
  function getDataOfHidden() {
    if (!id) return;

    const candidate = localStorage.getItem(ls);
    if (candidate === null) return;

    const listOfHidden = JSON.parseAs<SomeObject<boolean[]>>(candidate);
    if (!Object.keys(listOfHidden).length) return;

    const list = listOfHidden?.[id] || null;
    if (list === null || !list.length) return;

    // Очистка local storage
    if (data.length < list.length) {
      for (let i = list.length - 1; i >= 0; i--)
        if (i >= data.length || !list[i]) list.pop();

      if (!list.length)
        localStorage.setItem(ls, JSON.stringify(removeElementByKey(listOfHidden, id)));
      else {
        localStorage.setItem(ls, JSON.stringify({
          ...listOfHidden,
          [id]: list,
        }));
      }
    }

    return list;
  }

  function validateDataType() {
    if (!Array.isArray(data))
      throw new Error(`Не верно указан тип данных в свойстве повторителя 'baseTypes'`);

    return true;
  }

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
    baseTypes = baseTypes || defaultTypes();

    return baseKeys.reduce((obj, key) => {
      obj[key] = getDefaultValue(baseTypes![key]) as unknown as T[keyof T];
      return obj;
    }, {} as T);
  }

  /**
   * Checks if the element is empty
   * @param index Индекс элемента
   */
  function isFieldEmpty(index: number): boolean {
    baseTypes = baseTypes || defaultTypes();

    return (Object.keys(data[index]) as (keyof T)[]).every((key) => {
      return CompareData.isEquals(data[index][key], getDefaultValue(baseTypes![key]))
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
   * Saving hidden fields in local storage
   *
   * @param index
   * @param isHidden
   */
  function saveHiddenItemInStore(index: number, isHidden: boolean) {
    if (!id) return;
    const candidate = localStorage.getItem(ls);

    /* ====== utils ====== */

    const __save = (list: boolean[], data: SomeObject<boolean[]>) => {
      const isEmpty = data?.[id]?.every(item => !item) || false;

      if (isEmpty) {
        const result = removeElementByKey(data, id);

        if (Object.keys(result).length > 0)
          localStorage.setItem(ls, JSON.stringify(result));
        else
          localStorage.removeItem(ls);
      } else {
        localStorage.setItem(ls, JSON.stringify({
          ...data,
          [id]: list,
        }));
      }
    };

    const __push = (index: number, prev: boolean[] = [], withLast: boolean = true) => {
      if (index === 0 && !withLast)
        throw new Error("Не корректная операция!");

      const loop = withLast ? index : index - 1;

      for (let i = prev.length; i <= loop; i++)
        prev.push(i === index);

      return prev;
    };

    const __clear = (list: boolean[]) => {
      if (list[list.length - 1]) return list;

      for (let i = list.length - 1; i >= 0; i--) {
        if (!list[i]) list.pop();
        else break;
      }

      return list;
    };

    /* ====== methods ====== */

    const deleteItem = () => {
      if (candidate === null) return;

      const data = JSON.parse(candidate) as SomeObject<boolean[]>;
      let list = data[id];

      if (index >= list.length)
        list = __push(index, list, false);
      else if (index === list.length - 1)
        list.pop();
      else
        list[index] = false;

      __save(__clear(list), data);
    };

    const addItem = () => {
      if (candidate === null)
        __save(__push(index), {});
      else {
        const data = JSON.parse(candidate) as SomeObject<boolean[]>;
        let list = data?.[id] || [];

        if (typeof list[index] === "undefined")
          list = __push(index, list);
        else {
          list[index] = true;
          list = __clear(list);
        }

        __save(list, data);
      }
    };

    if (isHidden) addItem();
    else deleteItem();
  }

  /**
   * Intermediate event "onHide"
   *
   * @param index
   * @param isHidden
   * @param isInitial
   */
  const onItemToggleHide: OnHideItemRepeater = (index, isHidden, isInitial) => {
    onHideItem && onHideItem(index, isHidden, isInitial);

    if (!isInitial)
      saveHiddenItemInStore(index, isHidden);
  };

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
    <div className={scss.wrapper}>
      {typeof title !== "undefined" && (
        <div>
          <label className={"form-label"}>{title}</label>
        </div>
      )}
      <div className={scss.header}>
        <div className={scss.inner}></div>
        <div className={scss.inner}>
          Данные <span className={scss.required}>*</span>
        </div>
        <div className={scss.inner}></div>
      </div>
      <div className={scss.elements}>
        {validateDataType() && data.map((item, i) => (
          <ItemRepeater
            index={i}
            reducer={reducer}
            onHide={onItemToggleHide}
            isHidden={hidden?.[i] || false}
            key={i}
          >
            {onRender([data[i], onEdit], i)}
          </ItemRepeater>
        ))}
      </div>

      <div className={scss.button} onClick={push}>
        <button className="btn btn-outline-secondary" type="button">Добавить</button>
      </div>
    </div>
  );
}

export default BaseRepeater;
