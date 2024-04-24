export function ensureHexPrefix(hexString: string): string {
    if (hexString.startsWith('0x')) {
       return hexString;
    } else {
       return '0x' + hexString;
    }
   }