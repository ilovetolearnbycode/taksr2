const author = document.getElementById("author");
const quote  = document.getElementById("quote");
const refBtn = document.getElementById("resourceModalBtn");
const click = document.getElementById("click");
const form = document.getElementById("form");
const radioBtns = document.querySelectorAll("radio");
const listSubjectsBtn = document.getElementById("listSubjects");
const cardListContainer = document.querySelector(".cardListContainer");
const hideContent = document.getElementById("hideContent");
let refs = [];
window.addEventListener("load",(e)=>{
	e.preventDefault();
	setInterval(getsetQuote,10000);
});

refBtn.addEventListener("click",e=>{
	e.preventDefault();
	$('#resourceModal').on('shown.bs.modal', function (e) {
		let link = document.getElementById("resourceInput");
		link.value = "";
		let addRefBtn = document.getElementById("getLink");
		addRefBtn.addEventListener("click",e=>{
			refs.push(link.value);
			link.value = "";
		});
	});
});

form.addEventListener("submit",e=>{
	e.preventDefault();
	// getting information added to the form by the user!
	let formData = new FormData(form);
	let subjectName = formData.get("subjectName");
	let profName  = formData.get("profName");
	let firstNumber = formData.get("firstNumber");
	let lastNumber = formData.get("lastNumber");
	let initial_status = displayRadioValue();
	const data = {
		subjectName,
		profName,
		firstNumber,
		lastNumber,
		initial_status,
		refs
	};
	if(isDataSupported(data)){
		// here we send this data to the server
		const options =  {
		    method: 'POST', 
		    headers: {
		      'Content-Type': 'application/json'
		    },
		    body: JSON.stringify(data)
		  };
		 fetch("/addSubject",options)
		 .then(response=>{
		 		if(response.status===200){
		 			setModal("Added to database successfully!");
		 		}else if(response.status === 500){
		 			setModal("Server Problem! Try again later!");
		 		}else if(response.status === 402){
		 			setModal("Page not found!");
		 		}
		 	});
		form.reset();
		refs = [];
	}else{
		setModal("Data not supproted please enter a valid data!");
	}
});


// listing all the records from the database!
listSubjectsBtn.addEventListener("click",e=>{
	e.preventDefault();
	fetch("/getRecords")
	.then(response=>response.json())
	.then(data=>{
		for(let i = 0;i<data.length;i++){
			createCards(data[i]);
		}
		if(data.length !== 0){
			hideContent.click();
		}else{
			setModal("Database is empty!");
		}
		// on showing the modal delete and update actions are to be done!
		$(".bd-example-modal-xl").on("shown.bs.modal",(e)=>{
			const deleteBtns = document.querySelectorAll(".deleteMe");
			const updateBtns = document.querySelectorAll(".updateMe");
			if(deleteBtns.length !== 0 || updateBtns.length !== 0){
				deleteBtns.forEach(btn=>{
					btn.addEventListener("click",e=>{
						e.preventDefault();
						let currentTarget = e.target.parentElement.parentElement.parentElement;
						let index = getIndex(cardListContainer,currentTarget);
						let deleteId = document.querySelectorAll(".hide_id")[index].textContent;
						deleteSubject(deleteId);
						$(".hidethisbtn").trigger("click");
							$(".hidethisbtn").click(()=>{
								$(".bd-example-modal-xl").modal("hide");
						});
					});
				});
			
				// updating the contest!
				updateBtns.forEach(updateBtn=>{
					updateBtn.addEventListener("click",e=>{
						e.preventDefault();
						let currentUpdateTarget = e.target.parentElement.parentElement.parentElement;
						let indexUpdate = getIndex(cardListContainer,currentUpdateTarget);
						let updateId = document.querySelectorAll(".hide_id")[indexUpdate].textContent;
						updateSubject(updateId);
						$(".hidethisbtn").trigger("click");
							$(".hidethisbtn").click(()=>{
								$(".bd-example-modal-xl").modal("hide");
						});
					});
				});
			};

		});

		$(".bd-example-modal-xl").on("hidden.bs.modal",(e)=>{
			cardListContainer.innerHTML = "";
		});
		// on hiding the modal all the cardListContainer elements shpuld be gone!
		
	});
});


// functions
function getsetQuote(){
	fetch('https://api.quotable.io/random')
	  .then(response => response.json())
	  .then(data => {
	    author.textContent = data.author;
	    quote.textContent = data.content;
	});
}

function isDataSupported(dataObj){
	let name = dataObj.subjectName;
	let prof = dataObj.profName;
	let first = dataObj.firstNumber;
	let last = dataObj.lastNumber;
	return !(name.length===0 || prof.length===0 || first>last);
}

function getRadio(radioBtns){
	let state;
	radioBtns.forEach((radio,i)=>{
		if(radio.checked){
			state = i;
		}else{
			state = undefined;
		}
	});
	return state;
}

function displayRadioValue() { 
    const ele = document.getElementsByName('customRadioInline1'); 
     let state;
    for(i = 0; i < ele.length; i++) { 
        if(ele[i].checked) 	{
        	state = i;
        }
    } 
    return state;
}

function setModal(content){
	click.click();
	$(".bd-example-modal-sm").on("shown.bs.modal",(e)=>{
		let errorMessageP = document.getElementById("errorMessage");
		// errorMessage.textContent = "";
		errorMessageP.textContent = content;	
	});
}

function createCards(object){
	let remainingCountNumber = object.lastNumber - object.firstNumber;
	let percentage = (100-Math.floor((remainingCountNumber/(object.lastNumber))*100));
	let div = document.createElement("div");
	div.classList.add("card","text-white","bg-info","mb-3");

	let header = document.createElement("div");
	header.classList.add("card-header");
	header.textContent = object.profName;

	let invisibe_id = document.createElement("span");
	invisibe_id.classList.add("hide_id");
	invisibe_id.style.display = "none";
	invisibe_id.textContent = object._id;

	header.appendChild(invisibe_id);

	let body = document.createElement("div");
	body.classList.add("card-body");

	let h3 =  document.createElement("h3");
	h3.classList.add("card-title");
	h3.textContent = object.subjectName;

	let lectures = document.createElement("div");
	lectures.classList.add("lectures");
	lectures.textContent = "Lectures Remaining :";

	let span = document.createElement("span");
	span.classList.add("remainingCount");
	span.textContent = remainingCountNumber;
	lectures.appendChild(span);

	let progressDiv = document.createElement("div");
	progressDiv.classList.add("progress","m-2");
	let span1 = document.createElement("span");
	span1.textContent = percentage.toString() + "%";

	let progressBarDiv = document.createElement("div");
	progressBarDiv.classList.add("progress-bar","bg-danger");
	progressBarDiv.setAttribute("role","progressbar");
	progressBarDiv.style.width = percentage.toString() + "%";
	let minValue = object.firstNumber;
	progressBarDiv.setAttribute("aria-valuemin",minValue);
	let maxValue = object.lastNumber;
	progressBarDiv.setAttribute("aria-valuemax",maxValue);
	let currentValue = object.firstNumber;
	progressBarDiv.setAttribute("aria-valuenow",currentValue);
	progressDiv.append(span1,progressBarDiv);

	// progressP.append(lectures,progressDiv);

	let linkContainer = document.createElement("div");
	let h4 = document.createElement("h4");
	h4.textContent = "Resources";
	h4.classList.add("text-light");
	let linksList = object.refs;
	let listGroup = document.createElement("div");
	listGroup.classList.add("class","list-group");
	linksList = cleanData(linksList);
	for(let i = 0;i<linksList.length;i++){
		let a = document.createElement("a");
		a.href = linksList[i];
		a.setAttribute("target","_blank");
		a.classList.add("bg-dark","text-light","list-group-item","list-group-item-action");
		a.textContent = `Link ${i+1}`;
		listGroup.appendChild(a);
	}
	linkContainer.append(h4,listGroup);

	let hr = document.createElement("hr");
	hr.classList.add("bg-dark");

	let btnContainer = document.createElement("div");
	btnContainer.classList.add("btn-container","place_button");

	// let button1 = document.createElement("div");
	// button1.classList.add("btn","btn-dark","bottom_auto","updateMe");
	// button1.textContent = "Update";

	let button2 = document.createElement("div");
	button2.classList.add("btn","btn-danger","bottom_auto","deleteMe");
	button2.textContent = "Delete";
	// DEBUG : HERE WE ARE DISABLING BUTTON-1
	btnContainer.append(button2);

	body.append(h3,lectures,span1,progressDiv,linkContainer,hr,btnContainer);
	div.append(header,body);
	cardListContainer.appendChild(div);
	refs = [];
}

function deleteSubject(object_id){
	const data = {
		id : object_id
	};
	const option = {
		method : 'POST',
		headers : {
			"Content-Type":"application/json"
		},
		body:JSON.stringify(data)
	}

	fetch("/deleteSubject",option)
	.then(response=>{
		if(response.status == 200){
			setModal("Deleted subject successfully!");
		}else{
			setModal("Error deleting subject from the server!");
		}
	});
}

function getIndex(parentEle,childNode){
	let childs = parentEle.children;
	let index;
	for(let i = 0;i<childs.length;i++){
		if(childs[i] === childNode){
			index = i;
		}
	}
	return index;
}

function cleanData(listofUrls){
	let temp = [];
	listofUrls.forEach(url=>{
		if(url.length !== 0){
			temp.push(url);
		}
	});

	return temp;
}


// DEBUG: cannot update the content!

// function updateSubject(updateId){
// 	let updates = [];
// 	const gethiddenUpdateBtn = document.getElementById("hideUpdateBtn");
// 	$("#hideUpdateBtn").trigger("click");
// 	$("#updateTargetBtn").on('shown.bs.modal',(e)=>{
// 		const updateFormData = document.getElementById("updateFormData");
// 		const additionalRefBtn = document.getElementById("updateAddRefBtn");

// // getting the additional referece!
// 		additionalRefBtn.addEventListener("click",e=>{
// 			e.preventDefault();
// 			$("#additonalReferenceHiddenClick").trigger("click");
// 			$("#addAdditionalReferenceBtn").on("shown.bs.modal",(e)=>{
// 				$("#AddAdditonal").click((e)=>{
// 					e.preventDefault();
// 					let updateValue = document.getElementById("additionalReferenceValue").value;
// 					updates.push(updateValue);
// 					updateValue = "";
// 					document.getElementById("additionalReferenceValue").value = "";
// 					$("#addAdditionalReferenceBtn").modal("hide");
// 				});
// 			});
// 		});


// 	updateFormData.addEventListener("click",e=>{
// 		const updateFormSample = document.getElementById("updatedFormSample");
// 		const endNumber = document.getElementById("endNumberUpdate").value;
// 		// const notes = document.getElementById("notes").value;
// 		let temp = cleanData(updates);
// 		let data = {
// 			id : updateId,
// 			updates,
// 			endNumber
// 		};
// 		data.updates = temp;
// 		const options =  {
// 		    method: 'POST', 
// 		    headers: {
// 		      'Content-Type': 'application/json'
// 		    },
// 		    body: JSON.stringify(data)
// 		  };
// 		if(data.endNumber && (data.updates)){
// 			fetch("/update",options)
// 			.then(response=>{
// 				if(response.status === 200){
// 					setModal("Updated Successfully!");
// 				}else{
// 					setModal("Server error!");
// 				}
// 			});
// 		}
// 	updateFormSample.reset();
// 	$("#updateTargetBtn").modal("hide");
// 	});
// });

// 	$("#updateTargetBtn").on("hidden.bs.modal",(e)=>{
// 		updates = [];
// 	});
// }

























