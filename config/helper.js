export const generateRandomKey = (length = 5) => {
	var result          = '';
	var char1st         = 'bcdefghijklmnopqrstuvwxyz';
	var allChar         = '0123456789';
	var char1stlen      = char1st.length;
	var allCharlen      = allChar.length;

	for ( var i = 0; i < length; i++ ) {
		result += i == 0 
				? char1st.charAt(Math.floor(Math.random() * char1stlen))
				: allChar.charAt(Math.floor(Math.random() * allCharlen));
	}
	return result;
}