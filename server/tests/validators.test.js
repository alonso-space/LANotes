import { describe, expect, it } from 'vitest';
import {
  isLoginInputValid,
  isValidId,
  normalizeUsername,
  parseNoteInput,
  validateRegistration,
} from '../src/utils/validators.js';

describe('normalizeUsername', () => {
  it('recorta y pasa a minúsculas', () => {
    expect(normalizeUsername('  Ana_01 ')).toBe('ana_01');
  });

  it('devuelve vacío si no es texto', () => {
    expect(normalizeUsername({ a: 1 })).toBe('');
    expect(normalizeUsername(undefined)).toBe('');
  });
});

describe('validateRegistration', () => {
  it('acepta datos válidos', () => {
    expect(validateRegistration('ana', 'una-clave-larga')).toBeNull();
  });

  it('rechaza usuarios cortos, largos o con caracteres raros', () => {
    expect(validateRegistration('ab', 'una-clave-larga')).not.toBeNull();
    expect(validateRegistration('a'.repeat(31), 'una-clave-larga')).not.toBeNull();
    expect(validateRegistration('ana lópez', 'una-clave-larga')).not.toBeNull();
  });

  it('rechaza contraseñas cortas, vacías, no texto o de más de 72 bytes', () => {
    expect(validateRegistration('ana', '1234567')).not.toBeNull();
    expect(validateRegistration('ana', '        ')).not.toBeNull();
    expect(validateRegistration('ana', ['una-clave-larga'])).not.toBeNull();
    expect(validateRegistration('ana', 'ñ'.repeat(37))).not.toBeNull();
  });
});

describe('isLoginInputValid', () => {
  it('exige texto no vacío y dentro de los límites', () => {
    expect(isLoginInputValid('ana', 'x')).toBe(true);
    expect(isLoginInputValid('', 'x')).toBe(false);
    expect(isLoginInputValid('ana', { $ne: '' })).toBe(false);
    expect(isLoginInputValid('ana', 'x'.repeat(73))).toBe(false);
  });
});

describe('parseNoteInput', () => {
  it('recorta el título y usa "Sin título" si queda vacío', () => {
    expect(parseNoteInput({ title: '  Compras ', content: 'leche' }).value).toEqual({
      title: 'Compras',
      content: 'leche',
    });
    expect(parseNoteInput({ title: '   ' }).value).toEqual({ title: 'Sin título', content: '' });
  });

  it('rechaza tipos incorrectos y textos demasiado largos', () => {
    expect(parseNoteInput(undefined).error).toBeDefined();
    expect(parseNoteInput({ title: 5 }).error).toBeDefined();
    expect(parseNoteInput({ title: 'a', content: 5 }).error).toBeDefined();
    expect(parseNoteInput({ title: 'a'.repeat(101) }).error).toBeDefined();
    expect(parseNoteInput({ title: 'a', content: 'a'.repeat(20001) }).error).toBeDefined();
  });
});

describe('isValidId', () => {
  it('acepta solo enteros positivos de hasta 9 dígitos', () => {
    expect(isValidId('42')).toBe(true);
    expect(isValidId('0')).toBe(false);
    expect(isValidId('1; DROP TABLE notes')).toBe(false);
    expect(isValidId('1234567890')).toBe(false);
    expect(isValidId(['1'])).toBe(false);
  });
});
