String.prototype.toCapital = function (this: string): string {
  const str: string[] = this.split('');
  for (let i = 0; i < str.length; i++) {
    if (this[i] == ' ') continue;
    str[i] = str[i].toUpperCase();
    break;
  }
  return str.join('');
};

String.prototype.toCapitalAll = function (this: string): string {
  const words: string[] = this.split(' ');
  return words.map((word) => word.toCapital()).join(' ');
};
