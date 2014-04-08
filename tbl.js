/**
 * HTML Table Generator
 *
 * Init
 * var table = new tbl('#container');
 *
 * Export JSON
 * jsonstring = table.export.json();
 *
 * Export CSV
 * csvstring  = table.export.csv();
 *
 * Import JSON
 * table.import.json([['A1', 'B1'], ['A2', 'B2']])
 * or
 * table.import.json("[['A1', 'B1'], ['A2', 'B2']]")
 *
 *
 * @param {Object} ext Extends to
 * @param {string} lib Library name
 * @author Alejandro Moraga <moraga86@gmail.com>
 */
(function(ext, lib, undefined) {
	'use strict';

	function tbl(element) {
		// parent element
		this[0] = $(element);
		// table element
		this[1] = this[0].html(this.skel).children();
		
		// references
		this.export.tbl = this;
		this.import.tbl = this
		this.controls.tbl = this;
		
		// start controls
		this.controls.init();
	}

	tbl.prototype = {
		/**
		 * Table head index characters
		 * @var {string}
		 */
		cchr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
		
		/**
		 * Current table rows
		 * @var {number}
		 */
		rows: 1,
		
		/**
		 * Current table columns
		 * @var {number}
		 */
		cols: 1,
		
		/**
		 * Field models
		 */
		flds: {
			// text
			a: '<input type="text" name="%" size="6"/>',
			
			// radio 1
			b: '<input type="radio" name="%" class="b1" value=":B1"/> '+
			   '<input type="radio" name="%" class="b2" value=":B2"/>',
			
			// radio 2
			c: '<input type="radio" name="%" class="c1" value=":C1"/> '+
			   '<input type="radio" name="%" class="c2" value=":C2"/>'
		},
		
		skel: '' +
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
			'</table>',
		
		/**
		 * Adds a table row
		 */
		addRow: function() {
			var ref = $('tr:last-child', this[1]).prev(),
				cln = ref.clone(true),
				rws = ++this.rows,
				ipt = null;
			
			$('td', cln).each(function(i) {
				// first column (index)
				if (i == 0) {
					this.innerHTML = rws;
				}
				// second column (field type)
				else if (i == 1) {
					$('input', this).attr('name', rws);
				}
				// values
				else {
					ipt = $('input', this);
					
					// reset
					if (ipt.attr('type') == 'radio')
						ipt.attr('checked', false);
					else
						ipt.val('');
					
					// updates input name
					ipt.attr('name', function(j, v) {
						return v.replace(/^\d+/, rws);
					});
				}
			});
			
			// appends the new row
			cln.insertAfter(ref);
			
			// updates row add input
			this.controls.row.input.val(this.rows + 1);
		},
		
		/**
		 * Adds a table column
		 */
		addCol: function() {
			var pos = this.cols > this.cchr.length ? (this.cols % this.cchr.length || this.cchr.length) : this.cols + 1,
				cls = ++this.cols,
				ref = null,
				cln = null,
				chs = this.cchr;
			
			$('tr', this[0]).each(function(i) {
				ref = $('td:last-child', this).prev();
				cln = ref.clone(true);
				
				$('input', cln).each(function() {
					var e = $(this);
					
					// reset
					if (e.attr('type') == 'radio')
						e.attr('checked', false);
					else
						e.val('');
					
					e.attr('name', function(i, v) {
						return v.replace(/\d+$/, cls);
					});
				});
				
				// appends each column
				cln.insertAfter(ref);
				
				// first row
				if (i == 0) {
					// updates table desc
					cln.text(new Array(Math.floor((cls - 1) / chs.length + 1)).join(chs.charAt(0)) + chs.charAt(pos - 1));
				}
			});
			
			// updates col add input
			this.controls.col.input.val(this.cols + 1);
		},
		
		/**
		 * Applies the function in each table cell
		 * @param {Function} fn
		 */
		each: function(fn) {
			var
				// rows
				trs,
				// cols
				tds;
			
			(trs = this[0].find('tr')).each(function(i) {
				// ignore first and last rows
				if (i == 0 || i == trs.length - 1)
					return;
				
				(tds = $('td', this)).each(function(j) {
					// ignore first two cols and latest two cols
					if (j < 2 || j > tds.length - 2)
						return;
					
					var ipt = $('input', this),
						val = ipt.eq(0).attr('type') == 'radio' ? ipt.filter(':checked').val() : ipt.val();
					
					fn.call(this, i - 1, j - 2, val);
				});
			})
		},
		
		export: {
			tbl: null,
			
			/**
			 * Exports table data as JSON string
			 * @return {string}
			 */
			json: function() {
				var ret = '', cur = 0;
			
				this.tbl.each(function(row, col, val) {
					if (cur != row) {
						ret = ret.substr(0, ret.length - 1);
						ret += '],[';
						cur = row;
					}
					ret += '"'+ val +'",';
				});
				
				return '[['+ ret.substr(0, ret.length - 1) +']]';
			},
			
			/**
			 * Exports table data as CSV string
			 * @return {string}
			 */
			csv: function() {
				var ret = '', cur = 0;
				
				this.tbl.each(function(row, col, val) {
					// new row
					if (cur != row) {
						ret += "\n";
						cur = row;
					}
					ret += val +';';
				});
				
				return ret;
			}
		},
		
		import: {
			tbl: null,
			
			/**
			 * Imports JSON data
			 * @param {string} data JSON data
			 * @return {bool} TRUE on success
			 */
			json: function(data) {
				if (typeof data == 'string')
					data = JSON.parse(data);
				
				var rows = data.length,
					rowd = rows - this.tbl.rows,
					cols = data[0].length,
					cold = cols - this.tbl.cols,
					rwt = [],
					bk = false,
					i = 0,
					j = 0,
					k;
				
				for (; i < rows; i++) {
					bk = false;
					
					if (rowd-- > 0)
						this.tbl.addRow();
					
					for (k in this.tbl.flds) {
						if (this.tbl.flds[k].indexOf('value="'+ data[i][0] +'"') != -1) {
							$('tr:eq('+ (i + 1) +') td:eq(1) [value="'+ k +'"]', this.tbl[1]).click();
							rwt.push(/type="([^"]+)"/.exec(this.tbl.flds[k])[1]);
							bk = true;
							break;
						}
					}
					
					if (!bk) {
						$('tr:eq('+ (i + 1) +') td:eq(1) input:first-child', this.tbl[1]).click();
						rwt.push('text');
					}
				}
				
				for (; cold-- > 0; this.tbl.addCol());
				
				this.tbl.each(function(row, col) {
					if (rwt[row] == 'text')
						$('input', this).val(data[row][col]);
					else
						$('input[value="'+ data[row][col] +'"]', this).attr('checked', true);
				});
			},
			
			/**
			 * Imports CSV data
			 * @param {string} data CSV data
			 * @return {bool} TRUE on success
			 */
			csv: function() {
				
			}
		},
		
		controls: {
			tbl: null,
			
			row: {
				button: null,
				input : null
			},
			
			col: {
				button: null,
				input : null
			},
			
			init: function() {
				var self = this;
				
				$('tr:gt(0)', this.tbl[0]).each(function() {
					$('td:first-child + td input', this).on('click', function() {
						var val = this.value, idx = this.getAttribute('name'), tds = $(this).parent().parent().children();
						
						tds.each(function(i) {
							if (i > 1 && i < tds.length - 1) {
								this.innerHTML = self.tbl.flds[val].replace(/%/g, idx +','+ (i - 1));
							}
						});
					});
				});
				
				this.row.button = $('tr:last-child td:first-child', this.tbl[1])
					.on('click', function() {
						for (var i=parseInt(self.row.input.val()) - self.tbl.rows; i--; self.tbl.addRow());
					});
				
				this.row.input = $('input', this.row.button)
					.on('click', function(event) {
						event.stopPropagation();
					})
					.on('keypress', function(event) {
						if ((event.keyCode || event.which) == 13)
							self.row.button.click();
					});
				
				this.col.button = $('tr:first-child td:last-child', this.tbl[1]).on('click', function() {
					for (var i=parseInt(self.col.input.val()) - self.tbl.cols; i--; self.tbl.addCol());
				});
				
				this.col.input = $('input', this.col.button)
					.on('click', function(event) {
						event.stopPropagation();
					})
					.on('keypress', function(event) {
						if ((event.keyCode || event.which) == 13)
							self.col.button.click();
					});
			}
		}
	};
	
	ext[lib] = function(element) {
		return new tbl(element);
	};

})(window, 'tbl');