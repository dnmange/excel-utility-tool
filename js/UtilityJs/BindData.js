var scope = {};

(function(){
	var elements = document.querySelectorAll('[data-epilepsy-bind]');
	
	elements.forEach(function(element){
		if(element.tagName="SELECT"){
			var propToBind = element.getAttribute('data-epilepsy-bind');
			addScopeProp(propToBind);
			//i havent wrote the implementation of changing the value from dom element to property value
			//to complete two way binding, uncomment below code and loop through options tag to get 
			//array values 
			/*element.onchange = function(){
				scope[propToBind] = ;
			}*/
		}

		function addScopeProp (prop) {
			// body...
			if (!scope.hasOwnProperty(prop)) {
				var value;
				Object.defineProperty(scope,prop,{
					set : function(newValue){
						value: newValue;
						elements.forEach(function (element) {
							// body...
							if(element.getAttribute('data-epilepsy-bind')===prop){
								if(element.tagName && element.tagName==="SELECT"){
									var i=0;
									var options = element.children;
									if (element.childElementCount>0) {
										var childLength = options.length;	
									}else{
										var childlength = 0;
									}
									
									while (element.firstChild) {
									    element.removeChild(element.firstChild);
									}

									newValue.forEach(function(value){
										var childElement = document.createElement('option');
										childElement.text = value;
										childElement.setAttribute("value",value)
										element.append(childElement);
									
										if(i==0){
											options[i].selected = true;
										}
										i++
									});
								}
								if(element.tagName && (element.tagName==="THEAD" || element.tagName==="TBODY")){
									
									while (element.firstChild) {
									    element.removeChild(element.firstChild);
									}

									if(element.tagName==="THEAD")
									{
										var node = "th";
										newValue.forEach(function(value){
										var childElement = document.createElement(node);
										/*childElement.scope = "col";*/
										childElement.textContent = value;
										element.append(childElement);
										});
									}
									else{
										var node = "tr";
										newValue.forEach(function(row){
											var childElement = document.createElement(node);
											row.forEach(function(value){
												var td = document.createElement("td");
												/*td.scope = "row";*/
												if(value){
													td.textContent = value.v;		
												}else{
													td.textContent = "";
												}
												childElement.append(td);
												element.append(childElement);		
											});
										});
										
									}
								}
							}
						})
					}
				})
			};	
		}
	})
})();