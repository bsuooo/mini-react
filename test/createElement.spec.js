import { it, describe, expect } from 'vitest'
import React from '../react/react'

describe('createElement', () => {

  it('should create vdom', () => {
    const el = React.createElement('div', { id: 'foo' }, 'Hello World')

    expect(el).toMatchInlineSnapshot(`
      {
        "props": {
          "children": [
            {
              "props": {
                "children": [],
                "nodeValue": "Hello World",
              },
              "type": "TEXT_ELEMENT",
            },
          ],
          "id": "foo",
        },
        "type": "div",
      }
    `)
  })

  it('should create vdom with null props', () => {
    const el = React.createElement('div', null, 'Hello World')

    expect(el).toMatchInlineSnapshot(`
      {
        "props": {
          "children": [
            {
              "props": {
                "children": [],
                "nodeValue": "Hello World",
              },
              "type": "TEXT_ELEMENT",
            },
          ],
        },
        "type": "div",
      }
    `)
  })
})