const usePhoneFormatter = (value) => {

    let formattedValue = value?.replace(/\D/g, '');

    if (formattedValue.length <= 3) {
        formattedValue = `${formattedValue}`;
    } else if (formattedValue.length <= 6) {
        formattedValue = `(${formattedValue.slice(0, 3)}) ${formattedValue.slice(3)}`;
    } else if (formattedValue.length <= 10) {
        formattedValue = `(${formattedValue.slice(0, 3)}) ${formattedValue.slice(3, 6)}-${formattedValue.slice(6)}`;
    } else if (formattedValue.length >= 10) {
        formattedValue = formattedValue.slice(0, 10);
        formattedValue = `(${formattedValue.slice(0, 3)}) ${formattedValue.slice(3, 6)}-${formattedValue.slice(6)}`;
    }
    return formattedValue;
};

export default usePhoneFormatter;
