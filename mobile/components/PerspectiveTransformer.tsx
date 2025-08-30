// import React, { Component } from "react";
// import { View, TouchableOpacity, Text, Image, StyleSheet } from "react-native";
// import CustomCrop from "react-native-perspective-image-cropper";

// class CropView extends Component {
//   constructor(props) {
//     super(props);
    
//     this.state = {
//       imageWidth: 0,
//       imageHeight: 0,
//       initialImage: null,
//       image: null,
//       rectangleCoordinates: {
//         topLeft: { x: 10, y: 10 },
//         topRight: { x: 10, y: 10 },
//         bottomRight: { x: 10, y: 10 },
//         bottomLeft: { x: 10, y: 10 }
//       }
//     };
    
//     this.customCrop = null;
//     this.updateImage = this.updateImage.bind(this);
//     this.crop = this.crop.bind(this);
//   }

//   componentDidMount() {
//     const { imageUri } = this.props;
    
//     if (imageUri) {
//       Image.getSize(imageUri, (width, height) => {
//         // Set initial coordinates based on image dimensions for better user experience
//         this.setState({
//           imageWidth: width,
//           imageHeight: height,
//           initialImage: imageUri,
//           rectangleCoordinates: {
//             topLeft: { x: width * 0.1, y: height * 0.1 },
//             topRight: { x: width * 0.9, y: height * 0.1 },
//             bottomRight: { x: width * 0.9, y: height * 0.9 },
//             bottomLeft: { x: width * 0.1, y: height * 0.9 }
//           }
//         });
//       }, error => {
//         console.error("Error loading image dimensions:", error);
//       });
//     }
//   }

//   updateImage(image, newCoordinates) {
//     this.setState({
//       image,
//       rectangleCoordinates: newCoordinates
//     });
    
//     // If parent component wants to know about updates
//     if (this.props.onImageCropped) {
//       this.props.onImageCropped(image);
//     }
//   }

//   crop() {
//     if (this.customCrop) {
//       this.customCrop.crop();
//     }
//   }

//   render() {
//     const { imageWidth, imageHeight, initialImage, rectangleCoordinates } = this.state;
    
//     // Don't render the CustomCrop until we have image dimensions
//     if (!initialImage || imageWidth === 0 || imageHeight === 0) {
//       return (
//         <View style={styles.loadingContainer}>
//           <Text>Loading image...</Text>
//         </View>
//       );
//     }

//     return (
//       <View style={styles.container}>
//         <CustomCrop
//           updateImage={this.updateImage}
//           rectangleCoordinates={rectangleCoordinates}
//           initialImage={initialImage}
//           height={imageHeight}
//           width={imageWidth}
//           ref={ref => (this.customCrop = ref)}
//           overlayColor="rgba(18,190,210, 0.4)"
//           overlayStrokeColor="rgba(20,190,210, 1)"
//           handlerColor="rgba(20,150,160, 1)"
//           enablePanStrict={false}
//         />
//         <TouchableOpacity 
//           style={styles.cropButton} 
//           onPress={this.crop}
//         >
//           <Text style={styles.cropButtonText}>CROP IMAGE</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   cropButton: {
//     marginTop: 20,
//     backgroundColor: '#2196F3',
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 5,
//   },
//   cropButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   }
// });

// export default CropView;