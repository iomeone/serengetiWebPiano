import { useEffect } from 'react';
import { useRef } from 'react';

type ContentEditableProps = {
  value?: string;
  onChange: (value: string) => void;
};

export default function ContentEditable({
  value,
  onChange,
}: ContentEditableProps) {
  const elem = useRef<any>(null);

  useEffect(() => {
    if (value !== undefined) {
      elem.current.innerText = value;
    }
  }, [value]);

  const onMyChange = () => {
    console.log(elem.current.innerText);
    const v = elem.current.innerText;
    onChange && onChange(v as string);
  };

  const onPaste = (e: any) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    document.execCommand('insertText', false, text);
    onMyChange();
  };

  return (
    <div
      style={{
        cursor: 'text',
      }}
      ref={elem}
      contentEditable={true}
      onKeyUp={onMyChange}
      onPaste={onPaste}
    />
  );
}
