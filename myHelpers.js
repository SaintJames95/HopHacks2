module.exports = {
    makeTable: function (myArray) {
        var result = "<table border=1>";

	    for(var i=0; i<myArray.length; i++) {
	        result += "<tr>";
	        for(var key in myArray[i]){
	            result += "<td>"+myArray[i][key]+"</td>";
	        }
	        result += "</tr>";
	    }
	    result += "</table>";
	    return result;
    },
    raw: function (options) {
        return options.fn();
    }
}