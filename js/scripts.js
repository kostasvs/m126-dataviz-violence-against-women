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
	var mapOptions = {
		backgroundColor: 'transparent',
		colorAxis: { colors: ['#F5F5F5', '#e31b23'] },
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
			filters.find('.form-range').each(function () {
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

			default:
				return;
		}

		f3start = $('#f3start').val();
		f3end = $('#f3end').val();
		$('#f3starttext').text(f3start);
		$('#f3endtext').text(f3end);
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
	$.get("assets/us-incident-locations.csv", function (data) {

		chart4data = $.csv.toObjects(data, { separator: ';' });
		var locationCounts = chart4data.filter(x => x.offense == 0).map(x => [x.name, +x.count, x.code]);
		locationCounts.sort((a, b) => b[1] - a[1]);
		var codesSorted = locationCounts.map(x => x[2]);
		var locationsSorted = locationCounts.map(x => x[0]);
		chart4data.sort((a, b) => codesSorted.indexOf(a.code) - codesSorted.indexOf(b.code));

		var options = {
			chart: {
				type: 'bar',
				height: 1200
			},
			plotOptions: {
				bar: {
					horizontal: true,
				},
			},
			series: seriesChart4(),
			xaxis: {
				categories: locationsSorted,
				labels: {
					formatter: function (val) {
						return Math.exp(val).toFixed(0)
					}
				},
				min: 0,
				tickAmount: 1,
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
	});

	function seriesChart4() {

		var offenses = [1, 2, 3];
		var offenseName = ['', 'Sex offenses', 'Assault', 'Homicide'];
		var series = [];
		offenses.forEach(function (o) {
			series.push({
				name: offenseName[o],
				data: chart4data.filter(x => x.offense == o).map(x => +x.count > 0 ? Math.log(+x.count) : -1000)
			});
		});
		return series;
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
				height: 500,
			},
			plotOptions: {
				bar: {
					horizontal: true,
				},
			},
			series: seriesChart6(),
			xaxis: {
				categories: chart6data.filter(x => x.offense == 1).map(x => x.relationship),
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
					data: chart6data.filter(x => x.offense == o).map(x => +x.count)
				});
			}
		});
		return series;
	}

	// show/hide while scrolling
	const boxes = document.querySelectorAll('.scrollytellingBox, .scrollytellingBG');
	window.addEventListener('scroll', checkBoxes);
	checkBoxes();
	function checkBoxes() {
		const triggerBottom = window.innerHeight * 0.8;
		boxes.forEach(box => {
			const boxTop = box.getBoundingClientRect().top;
			if (boxTop < triggerBottom) {
				box.classList.add('show');
			}
		})
	}
});