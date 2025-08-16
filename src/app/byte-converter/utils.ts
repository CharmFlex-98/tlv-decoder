  function convertToBytes(input: string) {
    try {
      return Uint8Array.from(Buffer.from(input, 'utf-8'))
    } catch (err) {
      console.error("Conversion error:", err);
      return null;
    }
  };

  export {convertToBytes}