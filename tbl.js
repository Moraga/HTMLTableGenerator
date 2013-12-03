/**
 * HTML Table Generator
 *
 * Examples:
 *
 * 1) Creating new table
 *
 * <div id="mytable"></div>
 * var t = new tbl('#mytable');
 * ... 
 * // exporting
 * t.toJSON();
 *
 *
 * 2) Feeding table
 * <div id="mytable"></div>
 * var t = new tbl('#mytable');
 * t.import('[[":B1", ":B2", ":B2"],["A", "B", "C"],["X", "Y", "Z"],[":C1",":C2",":C2"]]');
 * 
 *
 * @author Alejandro Moraga <moraga86@gmail.com>
 */

/**
 * Creates a new table
 * @param {Object|string} parent Element to insert the table
 * @return {Object} Returns tbl object
 */
function tbl(parent) {
	var self = this,
		// table desc characters
		chrs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	
	// initial number of rows
	this.cols = 1;
	
	// initial number of columns
	this.rows = 1;
	
	// field types
	this.conf = {
		a: '<input type="text" name="%" size="6"/>',
		
		b: '<input type="radio" name="%" class="b1" value=":B1"/> '+
			'<input type="radio" name="%" class="b2" value=":B2"/>',
		
		c: '<input type="radio" name="%" class="c1" value=":C1"/> '+
			'<input type="radio" name="%" class="c2" value=":C2"/>'
	};
	
	// table structure
	this.tbl = $(parent).html(
		'<table>' +
			'<tr>' +
				'<td></td>' +
				'<td></td>' +
				'<td>A</td>' +
				'<td><input type="text" value="2" size="1"/></td>' +
			'</tr>' +
			'<tr>' +
				'<td>1</td>' +
				'<td>' +
					'<input type="radio" name="1" value="a" checked="checked"/> ' +
					'<input type="radio" name="1" value="b"/> '+
					'<input type="radio" name="1" value="c"/></td>' +
					'<td><input type="text" name="1,1" value="" size="6"/></td>' +
					'<td></td>' +
			'</tr>' +
			'<tr>' +
				'<td><input type="text" value="2" size="1"/></td>' +
				'<td></td>' +
				'<td></td>' +
				'<td></td>' +
				'<td></td>' +
			'</tr>' +
		'</table>'
	).children();
	
	// events
	$('tr:gt(0)', this.tbl).each(function() {
		$('td:first-child + td input', this).on('click', function() {
			var val = this.value, idx = this.getAttribute('name'), tds = $(this).parent().parent().children();
			
			tds.each(function(i) {
				if (i > 1 && i < tds.length - 1) {
					this.innerHTML = self.conf[val].replace(/%/g, idx +','+ (i - 1) );
				}
			});
		});
	});
	
	// controllers
	// for rows
	var addrow = $('tr:last-child td:first-child', this.tbl).on('click', function() {
		for (var i=parseInt(addrowipt.val()) - self.rows; i; self.addRow(), i--);
	});
	
	var addrowipt = addrow.find('input').on('click', function(event) {
		event.stopPropagation();
	});
	
	addrowipt.on('keypress', function(event) {
		if ((event.keyCode || event.which) == 13)
			addrow.click();
	});
	
	// for columns
	var addcol = $('tr:first-child td:last-child', this.tbl).on('click', function() {
		for (var i=parseInt(addcolipt.val()) - self.cols; i; self.addCol(), i--);
	});
	
	var addcolipt = addcol.find('input').on('click', function(event) {
		event.stopPropagation();
	});
	
	addcolipt.on('keypress', function(event) {
		if ((event.keyCode || event.which) == 13)
			addcol.click();
	});
	
	/**
	 * Adds a row in the table. The above row is cloned.
	 * @return {void}
	 */
	this.addRow = function() {
		this.rows++;
		
		var pen = $('tr:last-child', this.tbl).prev(),
			cln = pen.clone(true);
		
		cln.find('td').each(function(i) {
			// first col = index
			if (i == 0) {
				this.innerHTML = self.rows;
			}
			// controller column
			else if (i == 1) {
				$('input', this).attr('name', self.rows);
			}
			// values
			else {
				var e = $('input', this);
				
				// reset
				if (e.attr('type') == 'radio')
					e.attr('checked', false);
				else
					e.val('');
				
				// updates input name
				e.attr('name', function(j, v) {
					return v.replace(/^\d+/, self.rows);
				});
			}
		});
		
		// appends the new row
		cln.insertAfter(pen);
		
		// updates Add Row Input value
		addrowipt.val(this.rows + 1);
	};
	
	/**
	 * Adds a column in the table. The left column is cloned.
	 * @return {void}
	 */
	this.addCol = function() {
		this.cols++;
		
		if (this.cols > chrs.length) {
			pos = this.cols % chrs.length;
			if (!pos)
				pos = chrs.length;
		}
		else {
			pos = this.cols;
		}
		
		$('tr', this.tbl).each(function(i) {
			var pen = $('td:last-child', this).prev(),
				cln = pen.clone(true);
			
			cln.find('input').each(function() {
				var e = $(this);
				
				// reset
				if (e.attr('type') == 'radio')
					e.attr('checked', false);
				else
					e.val('');
				
				e.attr('name', function(i, v) {
					return v.replace(/\d+$/, self.cols);
				});
			});
			
			// appends each column
			cln.insertAfter(pen);
			
			// first row
			if (i == 0) {
				// updates table desc
				cln.text(new Array(Math.floor((self.cols - 1) / chrs.length + 1)).join(chrs.charAt(0)) + chrs.charAt(pos - 1));
			}
		});
		
		// updates the Add Col Input value
		addcolipt.val(this.cols + 1);
	};
	
	/**
	 * Applies the function in each row/column
	 * @param {Function} fn The function
	 */
	this.each = function(fn) {
		var trs = $('tr', this.tbl);
		
		trs.each(function(i) {
			if (i == 0 || i == trs.length - 1)
				return;
			
			var tds = $('td', this)
			
			tds.each(function(j) {
				if (j < 2 || j > tds.length - 2)
					return;
				
				var ipts = $('input', this),
					val = ipts.eq(0).attr('type') == 'radio' ? ipts.filter(':checked').val() : ipts.val();
				
				fn.call(this, i - 1, j - 2, val);
			});
		});
	};
	
	/**
	 * Export table data in JSON format
	 * @return {string} Returns a string containing the JSON representation of data
	 */
	this.toJSON = function() {
		var ret = '[[', currRow = 0;
		
		this.each(function(row, col, val) {
			if (currRow != row) {
				ret = ret.substr(0, ret.length - 1);
				ret += '],[';
				currRow = row;
			}
			ret += '"' + val + '",';
		});
		
		// removes the last comma
		ret = ret.substr(0, ret.length - 1);
		ret += ']]';
		
		return ret;
	};
	
	/**
	 * Export table data in CSV format
	 * @return {string} Returns a string containing the CSV representation of data
	 */
	this.toCSV = function() {
		var csv = '', currRow = 0;
		
		this.each(function(row, col, val) {
			if (currRow != row) {
				csv += "\n";
				currRow = row;
			}
			csv += val +';';
		});
		
		return csv;
	};
	
	/**
	 * Imports the JSON data into table
	 * @param {Object|string} data JSON data as object or string
	 * @return {void}
	 */
	this.import = function(data) {
		// parses the string
		if (typeof data == 'string')
			data = JSON.parse(data);
		
		var i = 0, j = 0, rows = data.length, cols = data[0].length, rwt = [];
		
		for (; i < rows; i++) {
			var bk = false;
			
			// creates the rows
			if (i)
				this.addRow();
			
			// defines the column type
			for (k in this.conf) {
				if (this.conf[k].indexOf('value="'+ data[i][0] +'"') != -1) {
					$('tr:eq('+ (i + 1) +') td:eq(1) [value="'+ k +'"]', this.tbl).click();
					rwt.push(/type="([^"]+)/.exec(this.conf[k])[1]);
					bk = true;
					break;
				}
			}
			
			if (!bk) {
				$('tr:eq('+ (i + 1) +') td:eq(1) input:first-child', this.tbl).click();
				rwt.push('text');
			}
		}
		
		// creates the columns
		for (i=0; i < cols - 1; i++)
			this.addCol();
		
		// fills the inputs
		this.each(function(i, j) {
			// text
			if (rwt[i] == 'text') {
				$('input', this).val(data[i][j]);
			}
			// option
			else {
				$('input[value="'+ data[i][j] +'"]', this).attr('checked', true);
			}
		});
	};
}