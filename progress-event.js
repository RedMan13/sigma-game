globalThis.ProgressEvent = function ProgressEvent(name, props) {
    this.lengthComputable = props.lengthComputable || false;
    this.loaded = props.loaded || false;
    this.total = props.total || 0;
    this.type = name;
    this.timeStamp = Date.now();
}