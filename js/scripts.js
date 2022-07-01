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

	var chart1;
	var chart1data;
	var f1type = 0, f1race = 5;
	$.get("assets/incident-counts-age-race-category.csv", function (data) {

		chart1data = $.csv.toObjects(data);

		var options = {
			chart: {
				type: 'line'
			},
			series: seriesChart1(),
			legend: {
				showForSingleSeries: true,
				position: 'top',
				horizontalAlign: 'right',
			},
			xaxis: {
				title: {
					text: "Age group (years)"
				},
				categories: [...Array(20).keys()].map(x => x * 5 + "-" + (x + 1) * 5)
			},
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
					data: chart1data.filter(x => x.offense == f1type && x.race == i).map(x => x.count)
				});
			}
			return series;
		}

		return [{
			name: 'incidents',
			data: chart1data.filter(x => x.offense == f1type && x.race == f1race).map(x => x.count)
		}];
	}
});