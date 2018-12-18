"use strict";

const URL = "http://176.119.156.90/";

const boxes = ["box1", "box2", "box3", "box4", "box5"];

function hideBoxes() {
	for(let i = 0; i < boxes.length; i++) {
		document.getElementById(boxes[i]).hidden = true;
	}
}

function showBox(id) {
	hideBoxes();
	document.getElementById(id).hidden = false;
}

function normalChar(charParam) {
    const s = "abcdefghijklmnopqrstuvwxyz".toUpperCase() + "1234567890";
    const c = charParam.toUpperCase();
    return s.indexOf(c) !== -1;
}

function normalString(stringParam) {
    const s = stringParam.toUpperCase();
    for(let i = 0; i < s.length; i++) {
        const c = s.charAt(i);
        if(normalChar(c) === false) {
            return false;
        }
    }
    return true;
}

function getElement(s) {
	return document.getElementById(s);
}

let fieldImage = "";

function workFile(files) {
	let file = files[0];
	let myReader = new FileReader();
	let ansString = "";
	myReader.readAsDataURL(file);
	myReader.onload = function(e) {
		ansString = e.target.result;
		fieldImage = ansString;
	}
}

function sendQuery(partUrl, body, callback) {
	const url = URL + partUrl;
	const r = new XMLHttpRequest();
	if(body) {
		r.open("POST", url, true);
		r.setRequestHeader("Content-Type","application/json;charset=UTF-8");
		r.send(body);
	} else {
		r.open("GET", url, true);
		r.setRequestHeader("Content-Type","application/json;charset=UTF-8");
		r.send(null);
	}
	r.onreadystatechange = function() {
		if(r.readyState === 4 && r.status === 200) {
			callback(r.responseText);
		}
	}
}

function clearDB() {
	const flag = confirm('Clear database?');
	if(flag === true) {
		sendQuery("api/database/init", null, (answer) => {
			const result = JSON.parse(answer).result;
			if(result === "INIT_DATABASE_OK") {
				alert("Очистка прошла успешно.");
				getElement("closeBtn").click();
			}
		});
	}
}

function clickSource(element) {
	const idString = element.id;
	const idNumber = parseInt(idString.toString().split('_')[1]);
	
	const input = prompt("Input number: ", "0");
	const number = parseInt(input);
	
	sendQuery("api/database/source/number/add", JSON.stringify({
		source_id: parseInt(idNumber),
		source_number: parseInt(number),
	}), (answer) => {
		const result = JSON.parse(answer).result;
		if(result === "ADD_NUMBER_TO_SOURCE_OK") {
			alert("Изменение прошло успешно.");
			getElement("updateListOfSourcesBtn").click();
		}
	});
}

function getUserSources(manIdParam) {
	const manId = parseInt(manIdParam);
	getElement("sourcesOfOneUserBox").innerHTML = "";
	sendQuery("api/database/source/user/" + manId+ "/get", null, (answer) => {
		getElement("sourcesOfOneUserBox").innerHTML = "";
		const userSourcesArr = JSON.parse(answer);
		sendQuery("api/database/source/get", null, (result) => {
			const sourcesArr = JSON.parse(result);
			const arr = [];
			userSourcesArr.forEach((userSource) => {
				sourcesArr.forEach((source) => {
					if(parseInt(userSource.have_source) === parseInt(source.source_id)) {
						arr.push({
							sourceId: userSource.have_source,
							sourceName: source.source_name,
							sourceDescription: source.source_description,
							sourceImage: source.source_image,
							haveNumber: userSource.have_number,
						});
					}
				});
			});
			getElement("sourcesOfOneUserBox").innerHTML = "";
			let content = "";
			arr.forEach((element) => {
				const e = element;
				content = content + "<table>";
				content = content + "<tr>";
				content = content + "<td>";
				content = content + "<img src = '" + element.sourceImage + "' width = '100px' height = '100px'>";
				content = content + "</td>";
				content = content + "<td style = 'width: 520px;'>";
				content = content + "<b>" + 'ID:' + "</b>&nbsp;&nbsp;" + e.sourceId + "<br>";
				content = content + "<b>" + 'Name:' + "</b>&nbsp;&nbsp;" + e.sourceName + "<br>";
				content = content + "<b>" + 'Description:' + "</b>&nbsp;&nbsp;" + e.sourceDescription + "<br>";
				content = content + "<b>" + 'Number:' + "</b>&nbsp;&nbsp;" + e.haveNumber + "<br>";
				content = content + "</td>";
				content = content + "</tr>";
				content += "</table>";
				content += "<br>";
			});
			
			if(arr.length > 0) {
				getElement("sourcesOfOneUserBox").innerHTML = content;
			} else {
				getElement("sourcesOfOneUserBox").innerHTML = "<h2>Список пуст</h2>"; 
			}
			showBox("box5");
		});
	});
}

window.onload = function() {
	hideBoxes();
	
	getElement("updateListOfSourcesBtn").onclick = () => {
		getElement("b4").click();
	}
	
	getElement("b4").onclick = () => {
		getElement("sourceBox").innerHTML = "";
		sendQuery("api/database/source/get", null, (answer) => {
			let content = "";
			const arr = JSON.parse(answer);
			getElement("sourceBox").innerHTML = "";
			arr.forEach((element) => {
				let data = "<table><tr>";
				data = data + "<td>";
				data = data + "<button onclick = 'clickSource(this);' id = '" + "source_" + element.source_id + "'>" + 'Изменить' + "</button>";
				data = data + "</td>";
				data = data + "<td>";
				data = data + "<img src = '" + element.source_image + "' width = '100px' height = '100px'>"
				data = data + "</td>";
				data = data + "<td style = 'min-width: 500px;'>";
				data = data + "<b>" + "ID:" + "</b>" + "&nbsp;&nbsp;" + element.source_id + "<br>";
				data = data + "<b>" + "Название:" + "</b>" + "&nbsp;&nbsp;" + element.source_name + "<br>";
				data = data + "<b>" + "Описание:" + "</b>" + "&nbsp;&nbsp;" + element.source_description + "<br>";
				data = data + "<b>" + "Количество:" + "</b>" + "&nbsp;&nbsp;" + element.source_number + "<br>";
				data = data + "</td>";
				data = data + "</tr></table>";
				data = data + "<br>";
				content += data;
			});
			getElement("sourceBox").innerHTML = content;
			showBox('box4');
		});
	};
	
	getElement("updateUsersListButton").onclick = () => {
		getElement("b3").click();
	};
	
	getElement("b3").onclick = () => {
		getElement("usersBox").innerHTML = "";
		sendQuery("api/database/users/get", null, (answer) => {
			const arr = JSON.parse(answer);
			getElement("usersBox").innerHTML = "";
			let content = "<table>";
			content = content + "<tr>";
			content = content + "<td class = 'headerClass'>" + 'ID пользователя' + "</td>";
			content = content + "<td class = 'headerClass'>" + 'Логин' + "</td>";
			content = content + "<td class = 'headerClass'>" + 'ID отдела' + "</td>";
			content = content + "<td class = 'headerClass'>" + 'Описание отдела' + "</td>";
			content = content + "<td class = 'headerClass'>" + 'Ресурсы' + "</td>";
			content = content + "</tr>";
			arr.forEach((element) => {
				content = content + "<tr>";
				content = content + "<td>" + element.man_id + "</td>";
				content = content + "<td>" + element.man_login + "</td>";
				content = content + "<td>" + element.man_department + "</td>";
				content = content + "<td>" + element.department_description + "</td>";
				content = content + "<td>" + "<button onclick = 'getUserSources(" + element.man_id + ");'>Получить ресурсы</button>" + "</td>";
				content = content + "</tr>";
			});
			content += "</table>";
			getElement("usersBox").innerHTML = content;
			showBox('box3');
		}); 
	}
	
	getElement("sendButtonUser").onclick = () => {
		let fieldLogin = getElement("fieldLogin").value;
		let fieldPassword = getElement("fieldPassword").value;
		
		let fieldDepartment = getElement("fieldDepartment").value;
		fieldDepartment = parseInt(fieldDepartment);
		
		const obj = {
			login: fieldLogin,
			password: fieldPassword,
			department: parseInt(fieldDepartment),
		}
		
		if(fieldLogin.length === 0) {
			alert("Пустой логин.");
			return;
		}
		
		if(fieldPassword.length === 0) {
			alert("Пустой пароль.");
			return;
		}
		
		if(normalString(fieldLogin) === false) {
			alert("Некорректный логин.");
			return;
		}
		
		if(normalString(fieldPassword) === false) {
			alert("Некорректный пароль.");
			return;
		}
		
		const dataString = JSON.stringify(obj);
		sendQuery("api/database/user/add", dataString.toString(), (answer) => {
			const result = JSON.parse(answer).result;
			if(result === "ADD_USER_OK") {
				alert("Добавление пользователя прошло успешно.");
			}
			if(result === "USER_ALREADY_EXISTS") {
				alert("Пользователь уже существует в базе данных.")
			}
		});
	}
	
	getElement("sendButton").onclick = () => {
		let fieldId = getElement("fieldId").value;
		let fieldName = getElement("fieldName").value;
		let fieldDescription = getElement("fieldDescription").value;
		let fieldNumber = getElement("fieldNumber").value;
		
		const mass = ['fieldId', 'fieldName', 'fieldDescription', 'fieldNumber'];
		
		for(let i = 0; i < mass.length; i++) {
			const s = mass[i].toString();
			if(getElement(s).value.toString().length === 0) {
				alert(s.split("field").join("") + " is empty.");
				return;
			}
		}
		
		fieldId = parseInt(fieldId);
		fieldNumber = parseInt(fieldNumber);
		
		if(isNaN(fieldId) === true) {
			alert("Id is not integer.");
			return;
		}
		
		if(isNaN(fieldNumber) === true) {
			alert("Number is not integer.");
			return;
		}
		
		const obj = {
			id: fieldId, 
			name: fieldName, 
			description: fieldDescription, 
			image: fieldImage, 
			number: fieldNumber,
		};
		
		const dataString = JSON.stringify(obj);
		sendQuery("api/database/source/add", dataString.toString(), (answer) => {
				const result = JSON.parse(answer).result;
				if(result === "ADD_SOURCE_OK") {
					alert("Источник успешно добавлен.");
				}
				if(result === "SOURCE_ALREADY_EXISTS") {
					alert("Источник уже существует в базе данных.");
				}
		});
	}
}

