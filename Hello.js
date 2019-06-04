import React from 'react';
import 'draft-js-image-plugin/lib/plugin.css';
import { EditorState, RichUtils, Entity, convertToRaw, convertFromRaw, ContentState, CompositeDecorator } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import { stateToHTML } from 'draft-js-export-html';
import Raw from 'draft-js-raw-content-state';
import createStyles from 'draft-js-custom-styles';
import createImagePlugin from 'draft-js-image-plugin';
import htmlToDraft from 'html-to-draftjs';
import {convertFromHTML} from "draft-convert"

const imagePlugin = createImagePlugin();
const plugins = [imagePlugin];



const customStyleMap = {
  green: {
    color: "#36db39"
  },
  blue: {
    color:"#0019ff"
  },
  red: {
    color:"#ff0000"
  },
  purple: {
    color:"#a100ff"
  },
  orange: {
    color:"#ff8c00"
  },
  black: {
    color: '#000000',
  },
  arial: {
    fontFamily: "Arial Black, Gadget, sans-serif"
  },
  helvetica: {
    fontFamily: "Arial, Helvetica, sans-serif"
  },
  times: {
    fontFamily: "Times New Roman, Times, serif"
  },
  courier: {
    fontFamily: "Courier New, Courier, monospace"
  },
  verdana: {
    fontFamily: "Verdana, Geneva, sans-serif"
  },
  georgia: {
    fontFamily: "Georgia, serif"
  },
  comic: {
    fontFamily: "Comic Sans MS, cursive, sans-serif"
  },
  trebuchet: {
    fontFamily: "Trebuchet MS, Helvetica, sans-serif"
  },
  impact: {
    fontFamily: "Impact, Charcoal, sans-serif"
  },
}

const blockStyle = (block) => {
  switch (block.getType()) {
    case 'left':
    return 'align-left';
    case 'center':
    return 'align-center';
    case 'right':
    return 'align-right';
    case 'unordered-list-item':
    return 'unordered';
    case 'ordered-list-item':
    return 'ordered';
    default:
    return null;
  }
}

const { styles, customStyleFn, exporter } = createStyles(['font-size', 'color'], 'PREFIX', customStyleMap);

// color
const toggleColor = styles.color.toggle;
const addColor = styles.color.add;
const removeColor = styles.color.remove;
const currentColor = styles.color.current;

// fontSize
const toggleFontSize = styles.fontSize.toggle;
const addFontSize = styles.fontSize.add;
const removeFontSize = styles.fontSize.remove;
const currentFontSize = styles.fontSize.current;


function mediaBlockRenderer(block) {
  // console.log(block.getType())
    if (block.getType() === 'atomic') {
      return {
        component: Media,
        editable: false,
      };
    }
    return null;
  }

// function findImageEntities(contentBlock, callback, contentState) {
//         contentBlock.findEntityRanges(
//           (character) => {
//             const entityKey = character.getEntity();
//             return (
//               entityKey !== null &&
//               contentState.getEntity(entityKey).getType() === 'IMAGE'
//             );
//           },
//           callback
//         );
//       }

// const Image = (props) => {
//   const {
//     height,
//     src,
//     width,
//   } = props.contentState.getEntity(props.entityKey).getData();
        
//   return (
//     <img src={src} height={300} width={300} />
//   );
// };


const Audio = (props) => {
  return <audio controls src={props.src} style={styles.media} />;
};
const Image = (props) => {
  return <img src={props.src} style={styles.media} />;
};
const Video = (props) => {
  return <video controls src={props.src} style={styles.media} />;
};

const Media = (props) => {
  const entity = props.contentState.getEntity(
    props.block.getEntityAt(0)
  );
  const {src} = entity.getData();
  const type = entity.getType();
  let media;
  console.log(type)
  if (type === 'audio') {
    media = <Audio src={src} />;
  } else if (type === 'image') {
    media = <Image src={src} />;
  } else if (type === 'video') {
    media = <Video src={src} />;
  }
  return media;
};

      
export default class Doc extends React.Component {
  constructor(props) {
    super(props);


    // const decorator = new CompositeDecorator([  
    //   {
    //     strategy: findImageEntities,
    //     component: Image,
    //   },
    // ]);

    const sampleMarkup =
            '<b>Bold text</b>, <i>Italic text</i><br/ ><br />' +
            '<a href="http://www.facebook.com">Example link</a><br /><br/ >' +
            '<img src="https://cdn-images-1.medium.com/max/1200/1*y6C4nSvy2Woe0m7bWEn4BA.png" height="300" width="300" />';

    const contentState = convertFromHTML({
        htmlToStyle: (nodeName, node, currentStyle) => {
            if (nodeName === 'span' && node.style.fontWeight === 'bold') {
                return currentStyle.add(node.style.fontWeight);
            } else {
                return currentStyle;
            }
        },
        htmlToEntity: (nodeName, node, createEntity) => {
            if (nodeName === 'img') {
              console.log(node.src)
                return createEntity(
                    "IMAGE",
                    "IMMUTABLE",
                    {"src": node.src, height: node.height, width: node.width},
                )
            }
        },
        htmlToBlock: (nodeName, node) => {
        if (nodeName === 'img') {
            return {
                type: 'atomic',
                data: {}
            };
        }
    }
    })(sampleMarkup);


    console.log(convertToRaw(contentState))


    

// const blocksFromHTML = convertFromHTML(sampleMarkup);
// const state = ContentState.createFromBlockArray(
//   blocksFromHTML.contentBlocks,
//   blocksFromHTML.entityMap
// );

    const editorState = EditorState.createWithContent(contentState)
    

    this.state = {
      editorState,
      title: "",
      owner: 'Owner',
      collaborators: [],
      showEditors: false,
      connected: null,
      disconnected: null
    };

    // const entityKey = Entity.create('IMAGE', 'IMMUTABLE', { src: "https://cdn-images-1.medium.com/max/1200/1*y6C4nSvy2Woe0m7bWEn4BA.png"});
    
    // setTimeout(() => this.setState({ editorState: EditorState.push(editorState, entityKey) }), 2000)
    this.onChange = this.onChange.bind(this);

  }

  exit() {
    this.props.navigate('main')
  }

  history() {
    this.props.navigate('history', this.props.userId ,this.props.docId)
  }


  onBoldClick(e) {
    e.preventDefault();
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'));
  }

  onItalicClick(e) {
    e.preventDefault();
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'ITALIC'));
  }

  onUnderlineClick(e) {
    e.preventDefault();
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'UNDERLINE'));
  }

  toggleFontSize(fontSize) {
    const newEditorState = styles.fontSize.toggle(this.state.editorState, fontSize);
    this.onChange(newEditorState);
  }

  toggleFontStyle(e) {
    const newEditorState = RichUtils.toggleInlineStyle(this.state.editorState, e.target.value)
    this.onChange(newEditorState)
  }

  toggleColor(color) {
    const newEditorState = styles.color.toggle(this.state.editorState, color);
    this.onChange(newEditorState);
  }

  toggleAlignment(e, blockType) {
    const newEditorState = RichUtils.toggleBlockType(this.state.editorState, blockType)
    this.onChange(newEditorState)
  }

  showEditors() {
    this.setState({ showEditors: !this.state.showEditors })
  }

  onChange(editorState) {
    //read the documentation --> Milestone 3
    //realtime change for content, highlighting, title, cursor
    // this.state.socket.emit("realtimeContent", )
    this.setState({
      editorState: editorState
    }, () => {
      const currentContent = convertToRaw(editorState.getCurrentContent());
    })
  }

  render() {
    const { editorState } = this.state;
    const inlineStyles = exporter(this.state.editorState);
    const html = stateToHTML(this.state.editorState.getCurrentContent(), { inlineStyles });
    const options = x => x.map(fontSize => {
      return <option key={fontSize} value={fontSize}>{fontSize}</option>;
    });

    const options2 = x => x.map((fontStyle, i) => {
      return <option key={i} value={fontStyle}>{fontStyle}</option>;
    });

    return (
      <div>
            <button onMouseDown={e => this.onBoldClick(e)}><img style={{height: "20px"}} src="bold.png"/></button>
            <select onChange={e => this.toggleFontStyle(e)}>
              {options2(['arial', 'comic', 'courier', 'georgia', 'helvetica', 'impact', 'times', 'trebuchet', 'verdana'])}
            </select>
                  <button onMouseDown={e => this.onItalicClick(e)}><img style={{height: "18px", paddingTop: "1px", paddingBottom: "1px"}} src="italic.svg"/></button>
                  <button onMouseDown={e => this.onUnderlineClick(e)}><img style={{height: "18px", marginTop: "2px"}} src="underline.png"/></button>
                  <select style={{marginLeft: "20px"}} onChange={e => this.toggleFontSize(e.target.value)}>
                    {options(['12px', '24px', '36px', '50px', '72px'])}
                  </select>
                  <select style={{marginLeft: "20px"}} onChange={e => this.toggleColor(e.target.value)}>
                    {options(['green', 'blue', 'red', 'purple', 'orange', 'black'])}
                  </select>
                  <button onMouseDown={e => this.toggleAlignment(e, "left")}> <img style={{height: "18px", marginTop: "2px"}} src="left.png"/> </button>
                  <button onMouseDown={e => this.toggleAlignment(e, "center")}> <img style={{height: "18px", marginTop: "2px"}} src="center2.png"/> </button>
                  <button onMouseDown={e => this.toggleAlignment(e, "right")}> <img style={{height: "18px", marginTop: "2px"}} src="right.png"/> </button>
                <button onMouseDown={e => this.toggleAlignment(e, "unordered-list-item")}><img style={{height: "18px", marginTop: "2px"}} src="bullets.png"/></button>
                  <button onMouseDown={e => this.toggleAlignment(e, "ordered-list-item")}><img style={{height:"18px", marginTop: "2px"}} src="numbers.png"/></button>
            <div style={{
              border: 'solid 1px',
              borderRadius: '5px',
              padding: '5px',
              margin: '10px',
              height: '50vh'
            }}>
            <Editor
              blockRendererFn={mediaBlockRenderer}
              placeholder="Hello... write here!!"
              customStyleFn={customStyleFn}
              customStyleMap={customStyleMap}
              editorState={this.state.editorState}
              onChange={this.onChange}
              blockStyleFn={blockStyle}
              plugins={plugins}
            />
          </div>
      </div>
    );
  }
}