import {DataTypeI} from '@franzzemen/re-data-type';

class ContrivedDataType implements DataTypeI {
  refName: string;

  constructor() {
    this. refName = 'Contrived Data Type'
  }

  eval(value: any): any {
    return 5;
  }

}

export function contrivedDataType() {
  return new ContrivedDataType();
}
