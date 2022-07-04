$(document).ready(function () {

	window.Apex = {
		chart: {
			foreColor: '#ccc',
			toolbar: {
				show: false
			},
			animations: {
				enabled: true,
				easing: 'easeout',
				speed: 1000,
			},
		},
		legend: {
			showForSingleSeries: true,
			position: 'top',
			horizontalAlign: 'right',
		},
		stroke: {
			width: 3,
		},
		dataLabels: {
			enabled: false
		},
		tooltip: {
			theme: 'dark'
		},
		grid: {
			borderColor: "#535A6C",
			xaxis: {
				lines: {
					show: true
				}
			}
		}
	};

	// Chart 1
	var chart1;
	var chart1data;
	var f1type = 0, f1race = 5;
	$.get("assets/us-incident-counts-age-race-category.csv", function (data) {

		chart1data = $.csv.toObjects(data);

		var options = {
			chart: {
				type: 'line'
			},
			series: seriesChart1(),
			xaxis: {
				title: {
					text: "Age (years)"
				},
				type: 'numeric',
				min: 0,
				max: 100,
				tickAmount: 10,
			},
			tooltip: {
				x: {
					formatter: function (val) {
						return (val - 2.5).toFixed(0) + ' - ' + (val + 2.5).toFixed(0) + " years";
					}
				}
			}
		}

		chart1 = new ApexCharts(document.querySelector("#chart-age-race"), options);
		chart1.render();

		$('#filters-age-race').fadeIn().find('.btn-check').each(function () {
			$(this).click(clickF1Option);
		});
	});

	function clickF1Option() {

		var optName = $(this).attr('name');
		var optVal = $(this).val();

		switch (optName) {
			case 'f1type':
				f1type = optVal;
				break;

			case 'f1race':
				f1race = optVal;
				break;

			default:
				return;
		}

		chart1.updateSeries(seriesChart1());
	}

	function seriesChart1() {

		if (f1race == 5) {
			var categories = ['All', 'White', 'Black', 'Native', 'Asian'];
			var series = [];
			for (let i = 0; i < categories.length; i++) {

				series.push({
					name: categories[i],
					data: chart1data.filter(x => x.offense == f1type && x.race == i).map(x => [(+x.agegroup + .5) * 5, x.count])
				});
			}
			return series;
		}

		return [{
			name: 'Incidents',
			data: chart1data.filter(x => x.offense == f1type && x.race == f1race).map(x => [(+x.agegroup + .5) * 5, x.count])
		}];
	}

	// Chart 2
	var chart2;
	var chart2data;
	var f2gender = 'Combined';
	$.get("assets/total_homicides_year.csv", function (data) {

		chart2data = $.csv.toObjects(data);

		var options = {
			chart: {
				type: 'line'
			},
			series: seriesChart2(),
			xaxis: {
				title: {
					text: "Year"
				},
				type: 'numeric',
				decimalsInFloat: 0,
			},
		}

		chart2 = new ApexCharts(document.querySelector("#chart-homicides-year"), options);
		chart2.render();

		$('#filters-homicides-year').fadeIn().find('.btn-check').each(function () {
			$(this).click(clickF2Option);
		});
	});

	function clickF2Option() {

		var optName = $(this).attr('name');
		var optVal = $(this).val();

		if (optName == 'f2gender') {
			f2gender = optVal;
		}

		chart2.updateSeries(seriesChart2());
	}

	function seriesChart2() {

		if (f2gender == 'Combined') {
			var categories = ['Total', 'Male', 'Female', 'Unknown'];
			var series = [];
			for (const element of categories) {

				series.push({
					name: element,
					data: chart2data.filter(x => x.Sex == element).map(x => [+x.Year, +x.victims])
				});
			}
			return series;
		}

		return [{
			name: 'Homicides',
			data: chart2data.filter(x => x.Sex == f2gender).map(x => [+x.Year, +x.victims])
		}];
	}

	// google geochart
	var chart3;
	var chart3data;
	var f3start = 1990;
	var f3end = 2020;
	var f3gender = 'Total';
	var f3measure = 'N';
	var f3region = 'world';
	var mapOptions = {
		backgroundColor: 'transparent',
		colorAxis: { colors: ['#F5F5F5', '#e31b23'] },
		datalessRegionColor: 'gray',
		region: f3region,
	};

	google.charts.load('current', {
		'packages': ['geochart'],
	});
	google.charts.setOnLoadCallback(drawRegionsMap);

	function drawRegionsMap() {

		$.get("assets/homicides_country_year.csv", function (data) {

			chart3data = $.csv.toObjects(data, { separator: ';' });

			let filters = $('#filters-homicides-country');
			filters.fadeIn().find('.btn-check').each(function () {
				$(this).click(clickF3Option);
			});
			filters.find('.form-range, .form-select').each(function () {
				$(this).change(clickF3Option);
			});

			var data3 = seriesChart3();
			chart3 = new google.visualization.GeoChart(document.getElementById('chart-homicides-country'));
			chart3.draw(data3, mapOptions);
		});
	}

	function clickF3Option() {

		var optName = $(this).attr('name');
		var optVal = $(this).val();

		switch (optName) {
			case 'f3start':
				f3start = +optVal;
				if (f3end < f3start) {
					$('#f3end').val(f3start);
				}
				break;

			case 'f3end':
				f3end = +optVal;
				if (f3end < f3start) {
					$('#f3start').val(f3end);
				}
				break;

			case 'f3gender':
				f3gender = optVal;
				break;

			case 'f3measure':
				f3measure = optVal;
				break;

			case 'f3region':
				f3region = optVal;
				break;

			default:
				return;
		}

		f3start = $('#f3start').val();
		f3end = $('#f3end').val();
		$('#f3starttext').text(f3start);
		$('#f3endtext').text(f3end);
		mapOptions.region = f3region;
		chart3.draw(seriesChart3(), mapOptions);
	}

	function seriesChart3() {

		var arr;
		var countries = [...new Set(chart3data.map(x => x.Country))];
		countries = countries.map(x => [x, 0]);
		arr = chart3data.filter(x => x.Sex == f3gender &&
			+x.Year >= f3start && +x.Year <= f3end &&
			x.Unit == f3measure)
			.map(x => [x.Country, +x.VALUE]);
		arr.forEach(function (item) {
			var i = countries.findIndex(function (c) {
				return c[0] == item[0];
			})
			if (i != -1) countries[i][1] += item[1];
		});
		arr = countries;
		arr.unshift(['Country', f3measure == 'N' ? 'Homicides' : 'Homicides per 100,000']);
		return google.visualization.arrayToDataTable(arr);
	}

	// Chart 4
	var chart4;
	var chart4data;
	var f4type = 0;
	$.get("assets/us-incident-locations.csv", function (data) {

		chart4data = $.csv.toObjects(data, { separator: ';' });

		var options = {
			chart: {
				type: 'bar',
				height: 1500
			},
			legend: {
				showForSingleSeries: false,
			},
			plotOptions: {
				bar: {
					horizontal: true,
				},
			},
			series: seriesChart4(),
			xaxis: {
				categories: categoriesChart4(),
				labels: {
					rotateAlways: true,
					minHeight: 80,
					formatter: function (val) {
						return Math.exp(val).toFixed(0)
					}
				},
				min: 0,
			},
			tooltip: {
				y: {
					formatter: function (val) {
						return Math.exp(val).toFixed(0)
					}
				}
			},
		}

		chart4 = new ApexCharts(document.querySelector("#chart-location1"), options);
		chart4.render();

		$('#filters-location-us').fadeIn().find('.btn-check').each(function () {
			$(this).click(clickF4Option);
		});
	});

	function clickF4Option() {

		var optName = $(this).attr('name');
		var optVal = $(this).val();

		if (optName == 'f4type') {
			f4type = optVal;
		}

		chart4.updateOptions({
			series: seriesChart4(),
			xaxis: {
				categories: categoriesChart4(),
				min: 0,
			},
		});
	}

	function seriesChart4() {

		var data = chart4data.filter(x => x.offense == f4type && +x.count > 0);
		data.sort((a, b) => +b.count - (+a.count));

		return [{
			name: 'Incidents',
			data: data.map(x => Math.log(+x.count))
		}];
	}

	function categoriesChart4() {

		var data = chart4data.filter(x => x.offense == f4type && +x.count > 0);
		data.sort((a, b) => +b.count - (+a.count));

		return data.map(x => x.name);
	}

	// Chart 5
	var chart5;
	var chart5data;
	$.get("assets/femicides_relationship.csv", function (data) {

		chart5data = $.csv.toObjects(data);
		var names = ['Family member', 'Intimate partner', 'Other, known to victim', 'Unknown to victim'];

		var options = {
			chart: {
				type: 'bar',
				height: 280,
			},
			plotOptions: {
				bar: {
					horizontal: true,
				},
			},
			series: seriesChart5(),
			xaxis: {
				categories: chart5data.map(x => names[x.Relationship]),
			},
		}

		chart5 = new ApexCharts(document.querySelector("#chart-relationship"), options);
		chart5.render();
	});

	function seriesChart5() {

		return [{
			name: 'Femicides',
			data: chart5data.map(x => +x.count)
		}];
	}

	// Chart 6
	var chart6;
	var chart6data;
	var f6type = 0;
	$.get("assets/us-incident-relationships.csv", function (data) {

		chart6data = $.csv.toObjects(data);

		var options = {
			chart: {
				type: 'bar',
				height: 1000,
			},
			plotOptions: {
				bar: {
					horizontal: true,
				},
			},
			series: seriesChart6(),
			xaxis: {
				categories: chart6data.filter(x => x.offense == 1).map(x => x.relationship),
				labels: {
					rotateAlways: true,
					minHeight: 64,
					formatter: function (val) {
						return Math.exp(val).toFixed(0)
					}
				},
				min: 0,
			},
			tooltip: {
				y: {
					formatter: function (val) {
						return Math.exp(val).toFixed(0)
					}
				}
			},
		}

		chart6 = new ApexCharts(document.querySelector("#chart-relationship-us"), options);
		chart6.render();

		$('#filters-relationship-us').fadeIn().find('.btn-check').each(function () {
			$(this).click(clickF6Option);
		});
	});

	function clickF6Option() {

		var optName = $(this).attr('name');
		var optVal = $(this).val();

		if (optName == 'f6type') {
			f6type = optVal;
		}

		chart6.updateSeries(seriesChart6());
	}

	function seriesChart6() {

		var offenses = [1, 2, 3];
		var offenseName = ['', 'Sex offenses', 'Assault', 'Homicide'];
		var series = [];
		offenses.forEach(function (o) {
			if (f6type == 0 || o == f6type) {
				series.push({
					name: offenseName[o],
					data: chart6data.filter(x => x.offense == o).map(x => +x.count > 0 ? Math.log(+x.count) : -1000)
				});
			}
		});
		return series;
	}

	// Chart 7
	var chart7;
	var chart7data;
	var f7type = 0, f7gender = 'M';
	$.get("assets/us-ages.csv", function (data) {

		chart7data = $.csv.toObjects(data);

		var options = {
			series: seriesChart7(false),
			chart: {
				type: 'heatmap',
			},
			colors: ["#e10000"],
			stroke: {
				width: 1,
				colors: ["darkgray"],
			},
			xaxis: {
				title: {
					text: "Perpetrator age (years)"
				},
				labels: {
					rotateAlways: true,
					maxHeight: 70,
				}
			},
			yaxis: {
				title: {
					text: "Victim age (years)"
				},
			},
		}

		chart7 = new ApexCharts(document.querySelector("#chart-ages-us"), options);
		chart7.render();

		$('#filters-ages-us').fadeIn().find('.btn-check').each(function () {
			$(this).click(clickF7Option);
		});
	});

	function clickF7Option() {

		var optName = $(this).attr('name');
		var optVal = $(this).val();

		switch (optName) {
			case 'f7type':
				f7type = optVal;
				break;

			case 'f7gender':
				f7gender = optVal;
				break;

			default:
				return;
		}

		chart7.updateSeries(seriesChart7(false));
		if (chart8 != undefined) chart8.updateSeries(seriesChart7(true));
	}

	function seriesChart7(forRaces) {

		var filtered = (forRaces ? chart8data : chart7data)
			.filter(x => x.offense == f7type && x.offender_gender == f7gender);
		var series = [];
		var groups = forRaces ? [1, 2, 3, 4] : [...Array(20).keys()];
		var races = ['Unknown', 'White', 'Black', 'Native', 'Asian'];
		for (const offender_group of groups) {

			var data = filtered.filter(x => (forRaces ? x.offender_race : x.offender_agegroup) == offender_group);
			data = data.map(function (x) {
				return {
					'x': +(forRaces ? x.victim_race : x.victim_agegroup),
					'y': +x.count,
				}
			});

			// fill missing data with zeros
			for (const i of groups) {
				if (data.findIndex(a => a.x == i) == -1) {
					data.push({
						'x': i,
						'y': 0,
					});
				}
			}

			for (const elem of data) {
				elem.x = forRaces ? races[elem.x] : (elem.x * 5) + " - " + ((elem.x + 1) * 5);
			}

			series.push({
				name: forRaces ?
					races[offender_group] :
					(offender_group * 5) + " - " + ((offender_group + 1) * 5),
				data: data
			});
		}
		return series;
	}

	// Chart 8
	var chart8 = undefined;
	var chart8data;
	$.get("assets/us-races.csv", function (data) {

		chart8data = $.csv.toObjects(data);

		var options = {
			series: seriesChart7(true),
			chart: {
				type: 'heatmap',
				height: 420,
			},
			colors: ["#e10000"],
			stroke: {
				width: 1,
				colors: ["darkgray"],
			},
			xaxis: {
				title: {
					text: "Perpetrator race"
				},
				labels: {
					rotateAlways: true,
					maxHeight: 70,
				}
			},
			yaxis: {
				title: {
					text: "Victim race"
				},
			},
		}

		chart8 = new ApexCharts(document.querySelector("#chart-races-us"), options);
		chart8.render();
	});

	// Chart 9
	var chart9;
	var chart9data;
	var f9type = 3, f9gender = 'M';
	$.get("assets/us-weapons.csv", function (data) {

		chart9data = $.csv.toObjects(data);

		var options = {
			chart: {
				type: 'bar',
				height: 600,
			},
			plotOptions: {
				bar: {
					horizontal: true,
				},
			},
			legend: {
				showForSingleSeries: false,
			},
			series: seriesChart9(),
			xaxis: {
				categories: categoriesChart9(),
				labels: {
					rotateAlways: true,
					minHeight: 50,
					maxHeight: 50,
					formatter: function (val) {
						return Math.exp(val).toFixed(0)
					},
				},
			},
			tooltip: {
				y: {
					formatter: function (val) {
						return Math.exp(val).toFixed(0)
					}
				}
			},
		}

		chart9 = new ApexCharts(document.querySelector("#chart-weapons-us"), options);
		chart9.render();

		$('#filters-weapons-us').fadeIn().find('.btn-check').each(function () {
			$(this).click(clickF9Option);
		});
	});

	function clickF9Option() {

		var optName = $(this).attr('name');
		var optVal = $(this).val();

		switch (optName) {
			case 'f9type':
				f9type = optVal;
				break;

			case 'f9gender':
				f9gender = optVal;
				break;

			default:
				return;
		}

		chart9.updateOptions({
			series: seriesChart9(),
			xaxis: {
				categories: categoriesChart9(),
			},
		});
		if (chart10 != undefined) {
			chart10.updateOptions({
				series: seriesChart10(),
				xaxis: {
					categories: categoriesChart10(),
				},
			});
		}
	}

	function seriesChart9() {

		return [{
			name: 'Incidents',
			data: chart9data.filter(x => +x.offense == f9type && x.offender_gender == f9gender)
				.map(x => +x.count > 0 ? Math.log(+x.count) : -1000)
		}];
	}

	function categoriesChart9() {

		var names = ['', 'Unarmed', 'Firearm', 'Handgun', 'Rifle', 'Shotgun', 'Other Firearm', 'Lethal Cutting Instrument',
			'Club/Blackjack/Brass Knuckles', 'Knife/Cutting Instrument', 'Blunt Object', 'Motor Vehicle/Vessel',
			'Personal Weapons', 'Poison', 'Explosives', 'Fire/Incendiary Device', 'Drugs/Narcotics/Sleeping Pills',
			'Asphyxiation', 'Other', 'Unknown', 'None', 'Firearm (Automatic)', 'Handgun (Automatic)', 'Rifle (Automatic)',
			'Shotgun (Automatic)', 'Other Firearm (Automatic)', 'Pushed or Thrown Out Window', 'Drowning', 'Strangulation'];
		return chart9data.filter(x => +x.offense == f9type && x.offender_gender == f9gender).map(x => names[+x.weapon]);
	}

	// Chart 10
	var chart10 = undefined;
	var chart10data;
	$.get("assets/us-injuries.csv", function (data) {

		chart10data = $.csv.toObjects(data);

		var options = {
			chart: {
				type: 'bar',
			},
			legend: {
				showForSingleSeries: false,
			},
			plotOptions: {
				bar: {
					horizontal: true,
				},
			},
			series: seriesChart10(),
			xaxis: {
				categories: categoriesChart10(),
				labels: {
					rotateAlways: true,
					minHeight: 50,
					maxHeight: 50,
				}
			},
		}

		chart10 = new ApexCharts(document.querySelector("#chart-injuries-us"), options);
		chart10.render();
	});

	function seriesChart10() {

		return [{
			name: 'Incidents',
			data: chart10data.filter(x => +x.offense == f9type && x.offender_gender == f9gender).map(x => +x.count)
		}];
	}

	function categoriesChart10() {

		var names = ['', 'Apparent Broken Bones', 'Possible Internal Injury', 'Severe Laceration', 'Minor Injury',
			'None', 'Other Major Injury', 'Loss of Teeth', 'Unconscious'];
		return chart10data.filter(x => +x.offense == f9type && x.offender_gender == f9gender).map(x => names[+x.injury]);
	}

	// Chart 11
	var chart11;
	var chart11data;
	var f11year = 2021;
	const monthDiv = 4;
	var chart11tooltips = [];
	$.get("assets/Femicides_greece_full.csv", function (data) {

		chart11data = $.csv.toObjects(data, { separator: ';' });

		var options = {
			series: seriesChart11(),
			chart: {
				type: 'heatmap',
				height: 200,
			},
			colors: ["#e10000"],
			stroke: {
				width: 3,
				colors: ["darkgray"],
			},
			tooltip: {
				custom: function ({ series, seriesIndex, dataPointIndex, w }) {

					var text = 'None';
					var extraClasses = '';

					var monthId = dataPointIndex;
					var div = seriesIndex;

					var obj = chart11tooltips.find(x => x.month == monthId && x.div == div);
					if (obj !== undefined) {
						text = '<ul>' + obj.text + '</ul>';
						extraClasses = ' ps-0 pb-0';
					}
					return '<div class="arrow_box p-2' + extraClasses + '">' + text + '</div>';
				},
			},
			xaxis: {
				labels: {
					maxHeight: 70,
				}
			},
			yaxis: {
				labels: {
					show: false,
				}
			}
		}

		chart11 = new ApexCharts(document.querySelector("#chart-femicides-gr"), options);
		chart11.render();

		$('#filters-femicides-gr').fadeIn().find('.btn-check').each(function () {
			$(this).click(clickF11Option);
		});
	});

	function clickF11Option() {

		var optName = $(this).attr('name');
		var optVal = $(this).val();

		if (optName == 'f11year') {
			f11year = optVal;
		}

		chart11.updateSeries(seriesChart11());
	}

	function seriesChart11() {

		chart11tooltips = [];
		var yearData = chart11data.filter(x => x.Year == f11year);
		var series = [];
		var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var monthIds = [...monthNames.keys()];
		for (let i = 0; i < monthDiv; i++) {

			var data = [];
			for (const m of monthIds) {
				var n = 0;
				for (const d of yearData) {
					var frac = Math.floor((d.Day - 1) / 31 * monthDiv);
					if (frac != i || +d.Month != m + 1) continue;

					n++;
					addChart11TooltipInfo(m, i, d);
				}
				data.push({
					'x': monthNames[m],
					'y': n,
				});
			}

			series.push({
				name: i,
				data: data
			});
		}
		return series;
	}

	function addChart11TooltipInfo(month, div, data) {

		var text = '<li>' + data.Day + '-' + data.Month + '-' + data.Year + ': ' +
			data.Name + ', aged ' + data.Age + ', region: ' + data.Place +
			', perpetrator: ' + data.Perpetrator + '</li>';

		var obj = chart11tooltips.find(x => x.month == month && x.div == div);
		if (obj === undefined) {
			obj = {
				month: month,
				div: div,
				text: text,
			};
			chart11tooltips.push(obj);
		}
		else obj.text += text;
	}

	// show/hide while scrolling
	const boxes = document.querySelectorAll('.scrollytellingTrigger');
	window.addEventListener('scroll', checkBoxes);
	checkBoxes();
	function checkBoxes() {
		const triggerBottom = window.innerHeight * 0.8;
		boxes.forEach(box => {
			const boxTop = box.getBoundingClientRect().top;
			if (boxTop < triggerBottom) {
				$(box).find('.scrollytellingBox').addClass('show');
			}
		})
	}
});