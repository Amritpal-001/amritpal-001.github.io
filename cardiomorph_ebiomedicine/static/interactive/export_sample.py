"""Read one saved CXAS sample and export browser assets; never run or edit notebooks.

Run with numpy, opencv-python-headless, scikit-image and pillow. All writes are
confined to --output. Archived function definitions are read through Python AST.
"""
import argparse
import ast
import hashlib
import json
from pathlib import Path
import shutil

import cv2
import numpy as np
from PIL import Image
from skimage import measure


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--archive', type=Path, required=True)
    parser.add_argument('--pyfeature', type=Path, required=True)
    parser.add_argument('--sample', type=Path, required=True, help='Sample prefix, without extension')
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    tracked = [args.archive / name for name in ['401_heart_graph_clean.ipynb', '501_heartVesselFeatures_clean.ipynb', '601_orientation_finder copy.ipynb', '601_orientation_finder.ipynb', 'src/cardiac_phenotype.py']]
    tracked += [args.pyfeature / name for name in ['border.py', 'shape.py']]
    before = {str(path): digest(path) for path in tracked}
    namespace = {'np': np, 'cv2': cv2, 'measure': measure}
    wanted = {'get_top_bottom_left_right_points', 'get_border', 'get_centroid', 'get_points', 'select_large_blob', 'get_surface_cords', 'get_surface_stats'}
    for path in [args.pyfeature / 'border.py', args.pyfeature / 'shape.py', args.archive / 'src/cardiac_phenotype.py']:
        tree = ast.parse(path.read_text(encoding='utf-8-sig'))
        functions = [node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name in wanted]
        exec(compile(ast.Module(body=functions, type_ignores=[]), str(path), 'exec'), namespace)
    labels = json.loads((args.archive / 'ChestXRayAnatomySegmentation/cxas/data/paxray_labels.json').read_text())['label_dict']
    image_path, mask_path = args.sample.with_suffix('.png'), args.sample.with_suffix('.npy')
    image = Image.open(image_path)
    masks = np.load(mask_path, allow_pickle=False)
    assert masks.shape == (159, 512, 512), masks.shape
    assert image.size == (512, 512), image.size
    args.output.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(image_path, args.output / 'sample-xray.png')
    specs = [('heart', 121, '#cddedb'), ('LA', 122, '#ee9388'), ('RA', 123, '#92a7e0'), ('LV', 125, '#8fc6a5'), ('RV', 126, '#edc987'), ('aorta', 127, '#d68891'), ('ascending_aorta', 128, '#e6aaa5'), ('descending_aorta', 129, '#b7a3cd'), ('aortic_arch', 130, '#e7b38b'), ('pulmonary_artery', 131, '#82c3ce'), ('inferior_vena_cava', 132, '#8faacb')]
    cleaned, structures, points_dict, landmark_chamber = {}, [], {}, {}
    for key, channel, color in specs:
        mask = namespace['select_large_blob'](masks[channel].astype(np.uint8))
        cleaned[key] = mask
        contour = max(measure.find_contours(mask, .5), key=len)
        xy = contour[:, ::-1].astype(np.float32)
        simplified = cv2.approxPolyDP(xy.reshape(-1, 1, 2), .45, True).reshape(-1, 2)
        centroid = namespace['get_centroid'](mask)
        rgba = np.zeros((512, 512, 4), dtype=np.uint8)
        rgba[..., :3] = [int(color[i:i+2], 16) for i in [1, 3, 5]]
        rgba[..., 3] = mask * 255
        Image.fromarray(rgba).save(args.output / f'mask-{key}.png')
        entry = {'id': key, 'channel': channel, 'name': labels[str(channel)], 'color': color, 'mask': f'mask-{key}.png', 'contour': simplified.tolist(), 'centroid': [float(centroid[1]), float(centroid[0])], 'pixel_area': int(mask.sum())}
        if key in ['LA', 'RA', 'LV', 'RV']:
            values = namespace['get_points'](mask)
            entry['landmarks'] = []
            for number, point in enumerate(values[:4], 1):
                name = f'{key}{number}'
                points_dict[name] = point
                landmark_chamber[name] = key
                entry['landmarks'].append({'id': name, 'position': [int(point[1]), int(point[0])], 'extremum': ['top', 'bottom', 'image left', 'image right'][number-1]})
        structures.append(entry)
    surfaces = {name: namespace['get_surface_cords'](points_dict, name) for name in ['anterior', 'inferior', 'left', 'right', 'upper']}
    stats = namespace['get_surface_stats'](surfaces)
    region_names = {'anterior': ['RA1', 'RA2', 'LV2', 'LA1'], 'inferior': ['RV3', 'RA2', 'LV2', 'LV4'], 'left': ['LV1', 'LV2', 'LV4', 'RV1'], 'right': ['RA1', 'RA3', 'RA2'], 'upper': ['RA1', 'LV1', 'RV1', 'LA1']}
    features = [{'id': name, 'landmarks': region_names[name], 'polygon': surfaces[name][:, ::-1].astype(int).tolist(), 'area': float(stats[name+'_area']), 'perimeter': float(stats[name+'_perimeter'])} for name in region_names]
    heart = cleaned['heart']
    vessel_features = []
    for key in ['aorta', 'ascending_aorta', 'descending_aorta', 'aortic_arch', 'pulmonary_artery', 'inferior_vena_cava']:
        overlap = cleaned[key] * heart
        outside = cleaned[key] * (1-heart)
        vessel_features.append({'id': key, 'overlap_pixels': int(overlap.sum()), 'outside_pixels': int(outside.sum()), 'overlap_to_heart': float(overlap.sum()/heart.sum())})
    above = cleaned['aorta'] * (1-heart)
    above[int(namespace['get_centroid'](heart)[0]):] = 0
    for key in ['ascending_aorta', 'descending_aorta', 'aortic_arch']:
        vessel_features.append({'id': key+'_above_heart', 'pixels': int((above*cleaned[key]).sum())})
    # Include only selected channels, compressed; the full 159-channel source stays in place.
    np.savez_compressed(args.output / 'sample-masks.npz', **cleaned)
    data = {'id': args.sample.name, 'width': 512, 'height': 512, 'image': 'sample-xray.png', 'coordinate_system': 'x=column, y=row, image origin top-left; exported directly from the 512x512 saved sample', 'kind': 'saved model-predicted segmentation, not manual ground truth', 'structures': structures, 'features': features, 'vessel_features': vessel_features, 'landmark_chamber': landmark_chamber, 'provenance': {'image_sha256': digest(image_path), 'source_mask_sha256': digest(mask_path), 'source_mask_shape': list(masks.shape), 'method_sha256': {path.name: before[str(path)] for path in tracked}, 'contour_simplification_max_error_pixels': .45, 'notes': ['Largest connected component retained per channel, matching the archived graph workflow.', 'Landmark extrema and feature area/perimeter use extracted original function definitions, including numpy tie-breaking.', 'No automatic rotation is applied: image and all masks already share a 512x512 frame.', 'Channel 132 uses the CXAS class-map name inferior vena cava; the vessel notebook calls that channel pulmonary vein.', 'This single figure sample uses saved native-frame segmentations; group analyses in the archive use registered outputs.', 'All 3D depth or layer separation in the viewer is assumed; features remain 2D pixel measurements.']}}
    (args.output / 'sample-data.json').write_text(json.dumps(data, indent=2), encoding='utf-8')
    (args.output / 'sample-data.js').write_text('window.CardioSample = '+json.dumps(data, separators=(',', ':'))+';\n', encoding='utf-8')
    assert all(digest(path) == before[str(path)] for path in tracked), 'Source changed during export'
    for structure in structures:
        assert structure['pixel_area'] > 0, structure['id']
        for landmark in structure.get('landmarks', []):
            x, y = landmark['position']
            assert cleaned[structure['id']][y, x] == 1
    print('Exported sample', data['id'], ':', len(structures), 'structures, 16 landmarks,', len(features), 'feature polygons.')
    print('Source notebook and helper hashes unchanged.')
    print('Feature measurements:', {f['id']: {'area_px2': f['area'], 'perimeter_px': round(f['perimeter'], 3)} for f in features})


if __name__ == '__main__':
    main()
