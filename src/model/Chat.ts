/*-----------------------------------------------------------------------------
 - Copyright (c) 2023.                                                        -
 - @tsrkzy/Github.                                                            -
 - tsrmix@gmail.com                                                           -
 - All rights reserved.                                                       -
 -----------------------------------------------------------------------------*/

export type ChatProps = {
  id: string;
  channel: string;
  alias: string | null;
  character: string | null;
  color: string;
  owner: string;
  room: string;
  type: string;
  value: { text: string };
  timestamp?: number | Date;
};

export class Chat {
  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }
  get channel(): string {
    return this._channel;
  }

  set channel(value: string) {
    this._channel = value;
  }
  get alias(): string | null {
    return this._alias;
  }

  set alias(value: string | null) {
    this._alias = value;
  }
  get character(): string | null {
    return this._character;
  }

  set character(value: string | null) {
    this._character = value;
  }
  get color(): string {
    return this._color;
  }

  set color(value: string) {
    this._color = value;
  }
  get owner(): string {
    return this._owner;
  }

  set owner(value: string) {
    this._owner = value;
  }
  get room(): string {
    return this._room;
  }

  set room(value: string) {
    this._room = value;
  }
  get type(): string {
    return this._type;
  }

  set type(value: string) {
    this._type = value;
  }
  get value(): { text: string } {
    return this._value;
  }

  set value(value: { text: string }) {
    this._value = value;
  }
  get timestamp(): number | Date {
    return this._timestamp;
  }

  set timestamp(value: number | Date) {
    this._timestamp = value;
  }
  private _id: string;
  private _channel: string;
  private _alias: string | null;
  private _character: string | null;
  private _color: string;
  private _owner: string;
  private _room: string;
  private _type: string;
  private _value: { text: string };
  private _timestamp: number | Date;

  /**
   * @param {ChatProps} args
   */
  constructor(args: ChatProps) {
    const {
      id,
      channel,
      alias,
      character,
      color,
      owner,
      room,
      type,
      value,
      timestamp = Date.now(),
    } = args;
    this._id = id;
    this._channel = channel;
    this._alias = alias;
    this._character = character;
    this._color = color;
    this._owner = owner;
    this._room = room;
    this._type = type;
    this._value = value;
    this._timestamp = timestamp;
  }
}