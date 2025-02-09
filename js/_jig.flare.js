/*
 * _jig.js - Handles all template management
 * 
 * Copyright (c) 2024 Greg Strange
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, subject to
 * including this permission notice in all copies or substantial portions
 * of the Software.
 */

class _jig
{
	constructor( _opts )
	{
		let _defaults = { ldelim: '~~', rdelim: '~~', default: null };
		this.opts = { ..._defaults, ..._opts };

		this.rendered = '';

		return this;
	}

	autotpl()
	{
		let $this = this;
		return new Promise(
			( _success, _fail ) =>
			{
				$( '.autotpl' ).each(
					( _index, _elem ) =>
					{
						let _id = $( _elem ).attr( 'id' );
						let _elemId = '#' + _id;
						let _tpl = $( _elemId ).attr( 'data-tpl' );
						this.fetchTpl( _tpl )
						.then(
							( _content ) =>
							{
								$( _elemId ).html( _content );
								$this.postPop( _id );
							}
						)
						.catch(
							( _msg ) =>
							{
								new _log( _id + ' failed autotpl with message ' + _msg );
							}
						);
					}
				);

				return _success( 'autotpl finished' );
			}
		);
	}

	postPop( _id )
	{
		new _log( 'postPop' );
		new _log( _id );

		if( '.' != _id.substring( 0, 1 ) )
		{
			_id = ( '#' + _id ).replace( '##', '#' );
		}
		
		$( _id ).find( '.autoload' ).each(
			( _loadIndex, _loadElem ) =>
			{
				let _loadId = $( _loadElem ).attr( 'id' );
				new _loader({}).load( '#' + _loadId );
			}
		);

		$( _id ).find( '.autoform' ).each(
			( _formIndex, _formElem ) =>
			{
				let _formId = $( _formElem ).attr( 'id' );
				new _form({ form_id: '#' + _formId, autoform: true }).autoform();
			}
		);

		$( _id ).find( '.autotable' ).each(
			( _tableIndex, _tableElem ) =>
			{
				let _tableId = $( _tableElem ).attr( 'id' );
				new _table({ table: '#' + _tableId }).initTable();
			}
		);

		$( _id ).find( '.autotoggle' ).each(
			( _toggleIndex, _toggleElem ) =>
			{
				let _toggleId = $( _toggleElem ).attr( 'id' );
				new _toggle({ elem: '#' + _toggleId }).setToggle();
			}
		);
	}

	fetchTpl( _tpl )
	{
		return new Promise(
			( _success, _fail ) =>
			{
				new _api({ url: '/_tpl/by_name/' + _tpl })
				.poll()
				.then(
					( _ret ) =>
					{
						if( 1 == _ret.return )
						{
							return _success( _ret.data );
						}
						else
						{
							return _fail( _ret );
						}
					}
				)
			}
		);
	}

	popTpl()
	{
		let _tplHandle = this.opts.tpl;
		let _data = this.opts.data;

		let _src = '';
		if( $( 'template#' + _tplHandle ).length )
		{
			_src = $( 'template#' + _tplHandle ).html();
		}
		else
		{
			_src = $( 'div#' + _tplHandle ).html();
		}

		if( '' == _src || 'undefined' == typeof _src )
		{
			new _log( _tplHandle + ' not found' );
			new _log( 'src', _src );
			return false;
		}

		for( let _i in _data )
		{
			if( null != _data[_i] )
			{
				var _item = _data[_i];
				if( Array.isArray( _item ) )
				{
					for( let _j in _item )
					{
						_item[_j] = _item[_j].toString().replace( '$', '&#36;' );
						_src = _src.replace( new RegExp( this.opts.ldelim + '(' + _i + '.' + _j + '?)' + this.opts.rdelim, 'g' ), _item[_j] );
					}
				}
				else
				{
					_item = _item.toString().replace( '$', '&#36;' );
					_src = _src.replace( new RegExp( this.opts.ldelim + '(' + _i + '?)' + this.opts.rdelim, 'g' ), _item );
				}
			}
		}

		_src = _src.replace( new RegExp( this.opts.ldelim + '(.*?)' + this.opts.rdelim, 'g' ), this.opts.default );

		return _src;
	}
}
