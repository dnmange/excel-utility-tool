var workbook,range,workSheet;
var fileSelected=false;

/*File is handled when file is selected*/
function handleFile(event){
	var type = event.target.files[0].type;
	if(!(type=="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
	{
		alert("Please select a excel file");
		return false;
	}
	var readFile = new FileReader(); 
	readFile.onload = function(event){
		var data = new Uint8Array(event.target.result);
		workbook = XLSX.read(data, {type:"array"});
		workSheet = workbook.Sheets["Sheet1"];
		range = XLSX.utils.decode_range(workSheet['!ref']);
		scope.columnBind = getColumnHeaderArray();
		$('.selectpicker').selectpicker('render');
		$('.selectpicker').selectpicker('refresh');
		fileSelected = true;
	};
	readFile.readAsArrayBuffer(event.target.files[0]);	
}

/*Perform Operations on Selected file when clicked on submit*/
function onSubmitData(){
	if(!fileSelected){
		alert("Please choose a valid file");
		return;
	}
	var select = document.getElementsByTagName('select')[0];
	var selectedValue = select.options[select.selectedIndex].value;
	
	
	if(selectedValue=='email' || selectedValue=="phone"){
		scope.rowBind = emailPhoneSelected(range,selectedValue,workSheet);
		var tableStyle = document.getElementById("invalidEmailTable").style;
		tableStyle.display = "table";
	}
	if(selectedValue=="replaceColumnValue"){
		var columnSelectedIndex = document.getElementById('replaceSelected').selectedIndex;
		var columnSelected = document.getElementById('replaceSelected')[columnSelectedIndex].value;
		console.log(replaceEmptyColumnValue(range,columnSelected,workSheet));
		var wopts = { bookType:'xlsx', bookSST:false, type:'array' };
		var wbout = XLSX.write(workbook,wopts);
		/* the saveAs call downloads a file on the local machine */
		saveAs(new Blob([wbout],{type:"application/octet-stream"}), "ModifiedExcel.xlsx");	
	}
}

/*Perform replace operation on selected column*/
function replaceEmptyColumnValue(range,selectedValue,workSheet){
	//var replaceSelected = document.getElementById("replaceSelected").selectedIndex;
	var wholeIndex = findColumnHeaderIndex(range,selectedValue,workSheet);
	if(wholeIndex!=undefined){
		var colIndex = wholeIndex.c;
		var object = {
			h:"Not Specified",
			r:"<t>Not Specified</t>",
			t:"s",
			v:"Not Specified",
			w:"Not Specified"
		}
		for (var i = 1; i < range.e.r ; i++) {
			var cell_address = {c:colIndex,r:i};	
			var cell_ref = XLSX.utils.encode_cell(cell_address);
			var cell_object = workSheet[cell_ref];
			if(cell_object==undefined || cell_object.v=="") {
				workSheet[cell_ref] = object;
			};
		};
	}
}

/*check for email/phone headers of excel file*/
function emailPhoneSelected(range,selectedValue,workSheet){
	var email_phone_cell = findColumnHeaderIndex(range,selectedValue,workSheet);
	var rows = [];
	if(email_phone_cell!=undefined){
		var email_col = email_phone_cell.c;
		for (var i = 1; i < range.e.r ; i++) {
			var cell_address = {c:email_col,r:i};	
			var cell_ref = XLSX.utils.encode_cell(cell_address);
			var cell_object = workSheet[cell_ref];
			if(cell_object==undefined || !validateEmailPhone(cell_object.v,selectedValue)) {
				colStartEnd = {s:0,e:range.e.c };
				rows.push(getDataHelper(i,colStartEnd,workSheet));
			};
		};

	}

	if (rows.length!=0) {
		//print array to html
		return rows;
	} else{
		var error_message = "No invalid "+selectedValue+" found";
		alert(error_message);
	}
}

/*Find Index of selected column*/
function findColumnHeaderIndex(range,selectedValue,workSheet){
	var initial_row = 0;
	var cellIndex;
	for (var C = range.s.c; C <= range.e.c; ++C) {
		var cell_address = {c:C,r:initial_row};
		var cell_ref = XLSX.utils.encode_cell(cell_address);
		var cell_object = workSheet[cell_ref];
		if(cell_object.t=="s" && (cell_object.v.toLowerCase()==selectedValue.toLowerCase() || cell_object.v.toLowerCase().includes(selectedValue)))
		{
			cellIndex = {
				c:C,
				r:initial_row
			}
			break;
		}
	}
	return cellIndex;	   
}

/*Get header data from selected excel file*/
function getColumnHeaderArray () {
	var initial_row = 0;
	var cellIndex;
	var colHeaderArray = [];
	for (var C = range.s.c; C <= range.e.c; ++C) {
		var cell_address = {c:C,r:initial_row};
		var cell_ref = XLSX.utils.encode_cell(cell_address);
		var cell_object = workSheet[cell_ref];
		colHeaderArray.push(cell_object.v);
	}
	return colHeaderArray;
}

/*Get data stored on specific row and column in worksheet*/
function getDataHelper(r,c,workSheet){
	var row = [];
	for(var i=c.s;i<=c.e;i++){
		var cell_address = {r:r,c:i};
		row.push(workSheet[XLSX.utils.encode_cell(cell_address)]);
	}
	return row;
}

/*Validate email and phone value*/
function validateEmailPhone(value,selectedValue)   {
	if(selectedValue=="email")
		return validateEmail(value);
	else if (selectedValue="phone") {
		return validatePhone(value);
	};
}

/*Regex to validate email*/
function validateEmail (value) {
	// body...
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(value);
}

/*Regex to validate phone*/
function validatePhone (value) {
	// body...
	var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
	return re.test(value);
}

/*Display div when user selected Replace column values*/
function displayDivColumnDiv () {
	// body...
	var select = document.getElementsByTagName('select')[0];
	var selectedValue = select.options[select.selectedIndex].value;
	var style = document.getElementById("columnDiv").style;
	if(selectedValue=="replaceColumnValue"){
		style.display="block";
		var tableStyle = document.getElementById("invalidEmailTable").style;
		tableStyle.display = "none";
	}else{
		style.display="none";	
	}	
}