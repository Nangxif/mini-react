import React from './react';
// import ReactDOM from 'react-dom/client';
import ReactDOM from './react-dom';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<React.StrictMode></React.StrictMode>);
/**
 * 虚拟dom的结构
 * $$typeof:Symbol(react.element)
   key:"title"
   props:{id: 'title', children: 'title'}
   ref:null
   type:"div"
   _owner:null
   _store:{validated: false}
   _self:undefined
   _source:{fileName: 'D:\\experiments\\react-demo\\mini-react\\src\\index.js', lineNumber: 6, columnNumber: 15}
   [[Prototype]]:Object
 * */
let element = (
  <div key="title" id="title">
    title
  </div>
);
ReactDOM.render(element, document.querySelector('#root'));
/**
 * babel会把jsx转成下面的函数
 *React.createElement("div", {
  key: "title",
  id: "title"
}, "title");
但是在17之后就不会转成这个了，所以我们需要在启动命令前加上set DISABLE_NEW_JSX_TRANSFORM=true
所以
 <div key="title" id="title">
    title
  </div>
  跟React.createElement是等价的，只是babel会转义jsx
* * */
// console.log(element);
// diff节点更新情况1：key相同，类型相同，数量相同，复用老节点，只更新属性
document.querySelector('#single1').addEventListener('click', () => {
  let element = (
    <div key="title" id="title">
      title
    </div>
  );
  ReactDOM.render(element, document.querySelector('#root'));
});

document.querySelector('#single1Update').addEventListener('click', () => {
  let element = (
    <div key="title" id="title2">
      title2
    </div>
  );
  ReactDOM.render(element, document.querySelector('#root'));
});

// 2.key相同，类型不同，删除老节点，添加新节点
document.querySelector('#single2').addEventListener('click', () => {
  let element = (
    <div key="title" id="title">
      title
    </div>
  );
  ReactDOM.render(element, document.querySelector('#root'));
});

document.querySelector('#single2Update').addEventListener('click', () => {
  let element = (
    <p key="title" id="title">
      title
    </p>
  );
  ReactDOM.render(element, document.querySelector('#root'));
});

// 3.类型相同，key不同,删除老节点，添加新节点
document.querySelector('#single3').addEventListener('click', () => {
  let element = (
    <div key="title1" id="title">
      title
    </div>
  );
  ReactDOM.render(element, document.querySelector('#root'));
});

document.querySelector('#single3Update').addEventListener('click', () => {
  let element = (
    <div key="title2" id="title">
      title
    </div>
  );
  ReactDOM.render(element, document.querySelector('#root'));
});

// 4.原来多个节点，现在只有一个节点,保留并更新这一个节点，删除其他节点
document.querySelector('#single4').addEventListener('click', () => {
  let element = (
    <ul key="ul">
      <li key="A">A</li>
      <li key="B" id="B">
        B
      </li>
      <li key="C">C</li>
    </ul>
  );
  ReactDOM.render(element, document.querySelector('#root'));
});

document.querySelector('#single4Update').addEventListener('click', () => {
  let element = (
    <ul key="ul">
      <li key="B" id="B2">
        B2
      </li>
    </ul>
  );
  ReactDOM.render(element, document.querySelector('#root'));
});

// 多节点diff
// 5.多个节点的数量，类型和key都相同，那么只需要更新属性
document.querySelector('#multi1').addEventListener('click', () => {
  let element = (
    <ul key="ul">
      <li key="A">A</li>
      <li key="B" id="B">
        B
      </li>
      <li key="C" id="C">
        C
      </li>
    </ul>
  );
  ReactDOM.render(element, document.querySelector('#root'));
});

document.querySelector('#multi1Update').addEventListener('click', () => {
  let element = (
    <ul key="ul">
      <li key="A">A</li>
      <p key="B" id="B2">
        B2
      </p>
      <li key="C" id="C2">
        C2
      </li>
    </ul>
  );
  ReactDOM.render(element, document.querySelector('#root'));
});

// 6.多个节点的类型和key全部相同，有新增元素
document.querySelector('#multi2').addEventListener('click', () => {
  let element = (
    <ul key="ul">
      <li key="A">A</li>
      <li key="B" id="B">
        B
      </li>
      <li key="C" id="C">
        C
      </li>
    </ul>
  );
  ReactDOM.render(element, document.querySelector('#root'));
});

document.querySelector('#multi2Update').addEventListener('click', () => {
  let element = (
    <ul key="ul">
      <li key="A">A</li>
      <li key="B" id="B2">
        B2
      </li>
      <li key="C">C</li>
      <li key="D">D</li>
    </ul>
  );
  ReactDOM.render(element, document.querySelector('#root'));
});

// 7.多个节点的类型和key全部相同，有删除老元素
document.querySelector('#multi2').addEventListener('click', () => {
  let element = (
    <ul key="ul">
      <li key="A">A</li>
      <li key="B" id="B">
        B
      </li>
      <li key="C" id="C">
        C
      </li>
    </ul>
  );
  ReactDOM.render(element, document.querySelector('#root'));
});

document.querySelector('#multi2Update').addEventListener('click', () => {
  let element = (
    <ul key="ul">
      <li key="A">A</li>
      <li key="B" id="B2">
        B2
      </li>
    </ul>
  );
  ReactDOM.render(element, document.querySelector('#root'));
});
