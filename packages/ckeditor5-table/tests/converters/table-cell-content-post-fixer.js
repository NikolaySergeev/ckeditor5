/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableEditing from '../../src/tableediting';
import { formatTable } from './../_utils/utils';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';

describe( 'Table cell content post-fixer', () => {
	let editor, model, root;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TableEditing, Paragraph, UndoEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				root = model.document.getRoot();
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'should add a paragraph to an empty table cell (on table insert)', () => {
		setModelData( model,
			'<table>' +
				'<tableRow>' +
					'<tableCell></tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		expect( formatTable( getModelData( model, { withoutSelection: true } ) ) ).to.equal( formatTable(
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		) );
	} );

	it( 'should add a paragraph to an empty table cell (on row insert)', () => {
		setModelData( model,
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		// Insert table row with one table cell
		model.change( writer => {
			writer.insertElement( 'tableRow', writer.createPositionAfter( root.getNodeByPath( [ 0, 0 ] ) ) );
			writer.insertElement( 'tableCell', writer.createPositionAt( root.getNodeByPath( [ 0, 1 ] ), 0 ) );
		} );

		expect( formatTable( getModelData( model, { withoutSelection: true } ) ) ).to.equal( formatTable(
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		) );
	} );

	it( 'should add a paragraph to an empty table cell (on table cell insert)', () => {
		setModelData( model,
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		// Insert table row with one table cell
		model.change( writer => {
			writer.insertElement( 'tableCell', writer.createPositionAt( root.getNodeByPath( [ 0, 0 ] ), 'end' ) );
		} );

		expect( formatTable( getModelData( model, { withoutSelection: true } ) ) ).to.equal( formatTable(
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		) );
	} );

	it( 'should add a paragraph to an empty table cell (after remove)', () => {
		setModelData( model,
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph>foo</paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		// Remove paragraph from table cell.
		model.change( writer => {
			writer.remove( writer.createRangeIn( root.getNodeByPath( [ 0, 0, 0 ] ) ) );
		} );

		expect( formatTable( getModelData( model, { withoutSelection: true } ) ) ).to.equal( formatTable(
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		) );
	} );

	it( 'should wrap in paragraph $text nodes placed directly in tableCell ', () => {
		setModelData( model,
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph></paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		// Remove paragraph from table cell & insert: $text<paragraph>$text</paragraph>$text.
		model.change( writer => {
			writer.remove( writer.createRangeIn( root.getNodeByPath( [ 0, 0, 0 ] ) ) );
			writer.insertText( 'foo', writer.createPositionAt( root.getNodeByPath( [ 0, 0, 0 ] ), 0 ) );

			const paragraph = writer.createElement( 'paragraph' );
			writer.insertText( 'bar', writer.createPositionAt( paragraph, 0 ) );
			writer.insert( paragraph, writer.createPositionAt( root.getNodeByPath( [ 0, 0, 0 ] ), 'end' ) );
			writer.insertText( 'baz', writer.createPositionAt( root.getNodeByPath( [ 0, 0, 0 ] ), 'end' ) );
		} );

		expect( formatTable( getModelData( model, { withoutSelection: true } ) ) ).to.equal( formatTable(
			'<table>' +
				'<tableRow>' +
					'<tableCell>' +
						'<paragraph>foo</paragraph>' +
						'<paragraph>bar</paragraph>' +
						'<paragraph>baz</paragraph>' +
					'</tableCell>' +
				'</tableRow>' +
			'</table>'
		) );
	} );
} );
