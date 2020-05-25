import Luxon from 'luxon';
import Utilities from 'util';

import { Is } from './is.js';

const { DateTime } = Luxon;
const Process = process;

const EXCLUDE_PROPERTY_NAME = ['constructor', '_formatConstructorParameter', '_formatParameter', '_formatReturnValue'];
const NANOSECONDS_PER_SECOND = 1000000000;

class LogHandler {

  constructor(log) {

    this._log = log;
    this._tabIndex = 0;

  }

  construct(target, parameter) {

    let className = target.name;

    let formatParameterFn = target._formatConstructorParameter ? target._formatConstructorParameter.bind(target, ...parameter) : this._formatParameter.bind(this, parameter);
    let [parameterAsObject, parameterAsString] = formatParameterFn();

    this._log.trace(parameterAsObject, `> ${'  '.repeat(this._tabIndex)}new ${className}(${parameterAsString})`);

    let start = Process.hrtime();
    let returnValue = Reflect.construct(target, parameter);
    let duration = this._getDuration(Process.hrtime(start));

    this._log.trace({ ...parameterAsObject, duration }, `< ${'  '.repeat(this._tabIndex)}new ${className}(${parameterAsString})`);

    return new Proxy(returnValue, this);

  }

  // getPrototypeOf(target) {

  //   let className = target.name || target.constructor.name
  //   this._log.trace(`= ${'  '.repeat(this._tabIndex)}LogHandler.getPrototypeOf(${className})`)

  //   return Reflect.getPrototypeOf(target)

  // }

  get(target, propertyName, receiver) {

    let className = target.name || target.constructor.name;
    // this._log.trace(`= LogHandler.get(${className}, ${this._formatPrimitive(propertyName)}, ...)`)

    let returnValue = Reflect.get(target, propertyName, receiver);

    // if (Is.primitive(returnValue) ||
    //     Is.not.symbol(propertyName) &&
    //     ( propertyName === FORMAT_CONSTRUCTOR_PARAMETER || 
    //       propertyName === FORMAT_PARAMETER || 
    //       propertyName === FORMAT_RETURN_VALUE)) {
    //   return returnValue
    // } else {
    //   // this._log.trace(`LogHandler.get(target, ${this._formatPrimitive(propertyName)}, receiver)`)
    //   return new Proxy(returnValue, this)
    // }

    if (Is.functionOrAsyncFunction(returnValue) &&
    !EXCLUDE_PROPERTY_NAME.includes(propertyName)) {
      // this._log.trace('= return new Proxy(returnValue, this)')
      return new Proxy(returnValue, this);
    } else {
      return returnValue;
    }

  }

  apply(target, self, parameter) {

    this._applyIn(target, self, parameter);

    let start = null;
    let returnValue = null;
    let duration = null;

    try {
      start = Process.hrtime();
      returnValue = Reflect.apply(target, self, parameter);
      duration = this._getDuration(Process.hrtime(start));
    } catch (error) {
      this._applyException(target, self, parameter, error);
      this._tabIndex--;
      throw error;
    }

    if (returnValue instanceof Promise) {

      returnValue = returnValue.then(_returnValue => {

        duration = this._getDuration(Process.hrtime(start));
        this._applyOut(target, self, parameter, duration, _returnValue);

        // return Is.primitive(_returnValue) || _returnValue instanceof Promise ? _returnValue : new Proxy(_returnValue, this)
        // return _returnValue

        if (Is.functionOrAsyncFunction(_returnValue)) {
          return new Proxy(_returnValue, this);
        } else {
          return _returnValue;
        }

      });

    } else {
      this._applyOut(target, self, parameter, duration, returnValue);
    }

    // return Is.primitive(returnValue) || returnValue instanceof Promise ? returnValue : new Proxy(returnValue, this)
    // return returnValue

    if (Is.functionOrAsyncFunction(returnValue)) {
      return new Proxy(returnValue, this);
    } else {
      return returnValue;
    }

  }

  _applyIn(target, self, parameter) {
    let [className, methodName, parameterAsObject, parameterAsString] = this._getFormattedIn(target, self, parameter);
    this._log.trace(parameterAsObject, `> ${'  '.repeat(this._tabIndex)}${Is.null(className) ? '' : `${className}.`}${methodName}(${parameterAsString})`);
    this._tabIndex++;
  }

  _applyException(target, self, parameter, error) {
    // when using nestedKey, pino does not seem to add the message and stack to the nested key
    // this._log.error(error)
    this._tabIndex--;
    this._log.error({ 'message': error.message, 'stack': error.stack, 'type': error.constructor.name }, error.message);
  }

  _getFormattedIn(target, self, parameter) {

    let className = Is.undefined(self) ? null : self.name || self.constructor.name;
    let methodName = target.name;

    // let formatParameterFn = null
    // formatParameterFn = Is.undefined(self) ? null : self[`_format${PascalCase(methodName)}Parameter`] || null
    // formatParameterFn = Is.null(formatParameterFn) ? formatParameterFn : formatParameterFn.bind(self)

    let formatParameterFn = target._formatParameter ? target._formatParameter.bind(target, ...parameter) : this._formatParameter.bind(this, parameter);
    let [parameterAsObject, parameterAsString] = formatParameterFn();

    return [className, methodName, parameterAsObject, parameterAsString];

  }

  _applyOut(target, self, parameter, duration, returnValue) {
    let [className, methodName, parameterAsObject, parameterAsString, returnValueAsObject, returnValueAsString] = this._getFormattedOut(target, self, parameter, returnValue);
    this._tabIndex--;
    this._log.trace({ ...parameterAsObject, ...returnValueAsObject, duration }, `< ${'  '.repeat(this._tabIndex)}${Is.null(className) ? '' : `${className}.`}${methodName}(${parameterAsString})${Is.undefined(returnValue) || Is.emptyString(returnValueAsString) ? '' : ` returned ${returnValueAsString}`}`);
  }

  _getFormattedOut(target, self, parameter, returnValue) {

    let [className, methodName, parameterAsObject, parameterAsString] = this._getFormattedIn(target, self, parameter);

    // let formatReturnValueFn = null
    // formatReturnValueFn = Is.undefined(self) ? null : self[`_format${PascalCase(methodName)}ReturnValue`] || null
    // formatReturnValueFn = Is.null(formatReturnValueFn) ? formatReturnValueFn : formatReturnValueFn.bind(self)

    let formatReturnValueFn = target._formatReturnValue ? target._formatReturnValue.bind(target, returnValue) : this._formatReturnValue.bind(this, returnValue);
    let [returnValueAsObject, returnValueAsString] = formatReturnValueFn();

    return [className, methodName, parameterAsObject, parameterAsString, returnValueAsObject, returnValueAsString];

  }

  _getDuration([seconds, nanoseconds]) {
    return seconds * NANOSECONDS_PER_SECOND + nanoseconds;
  }

  _formatParameter(parameterAsArray, keyPrefix = 'p') {

    let index = 0;
    let key = null;

    let parameterAsObject = {};
    let parameterAsString = parameterAsArray.
    map(value => {

      switch (true) {
        case Is.null(value):
          return 'null';
        case Is.undefined(value):
          return 'undefined';
        case Is.primitive(value):
          return this._formatPrimitive(value);
        case Is.date(value):
          return this._formatDateTime(value);
        case Is.regexp(value):
          return value.toString();
        case Is.functionOrAsyncFunction(value):
          return value.name;
        default:

          key = `${keyPrefix}${index++}`;
          parameterAsObject[key] = value;

          return key;}



    }).
    join(', ');

    return [parameterAsObject, parameterAsString];

  }

  _formatReturnValue(returnValue, keyPrefix = 'r') {
    return this._formatParameter([returnValue], keyPrefix);
  }

  _formatPrimitive(value) {
    return Utilities.inspect(value);
  }

  _formatDateTime(value) {
    return `'${DateTime.fromJSDate(value).toFormat('yyyy.LL.dd-HH:mm:ss.SSSZZZ')}'`;
  }}



export { LogHandler };
//# sourceMappingURL=log-handler.js.map