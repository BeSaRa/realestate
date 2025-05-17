import { InterceptModel } from 'cast-response';
import { Lookup } from './lookup';
import { GeneralSecretariatTransactionInterceptor } from '@model-interceptors/general-secretariat-interceptor';
import { BaseTableRowModel, TableColPrint } from '@abstracts/base-table-row-model';

const { receive, send } = new GeneralSecretariatTransactionInterceptor();

@InterceptModel({ receive, send })
export class GeneralSecretariatTransaction extends BaseTableRowModel {
  readonly occupationMap: Record<number, Lookup> = {
    0: new Lookup().clone<Lookup>({
      arName: '---',
      enName: '---',
    }),
    1: new Lookup().clone<Lookup>({
      arName: 'مشغول',
      enName: 'Occupied',
    }),
    2: new Lookup().clone<Lookup>({
      arName: 'شاغر',
      enName: 'Vacant',
    }),
    3: new Lookup().clone<Lookup>({
      arName: 'ليس في كهرماء',
      enName: 'Not in Kahramaa',
    }),
    4: new Lookup().clone<Lookup>({
      arName: 'لايوجد رقم كهرباء',
      enName: 'No Electricity_NO',
    }),
  };

  area!: number;
  bedRoomsCount!: number;
  buildingNo!: number;
  certificateCode!: string;
  electricityNo!: number;
  endDate!: string;
  furnitureStatusId!: number;
  issueDate!: string;
  municipalityid!: number;
  zoneNo!: number;
  occupancyStatus!: number;
  pinNo!: number; //
  propertyDescription!: string;
  propertyTypeId!: number;
  purposeId!: number;
  rentPaymentAmount!: number;
  rentPaymentFrequency!: number;
  startDate!: string;
  streetNo!: number;
  subUnitCount!: number; //
  waterNo!: number;

  municipalityInfo!: Lookup;
  zoneInfo!: Lookup;
  furnitureInfo!: Lookup;
  purposeInfo!: Lookup;
  propertyTypeInfo!: Lookup;
  occupancyStatusInfo!: Lookup;

  protected override getAllPrintCols(): TableColPrint[] {
    return [
      { header: 'municipal', cellValue: this.municipalityInfo, isLookup: true },
      { header: 'zone', cellValue: this.zoneInfo, isLookup: true },
      { header: 'street', cellValue: this.streetNo },
      { header: 'building_number', cellValue: this.buildingNo },
      { header: 'purpose', cellValue: this.purposeInfo, isLookup: true },
      { header: 'property_type', cellValue: this.propertyTypeInfo, isLookup: true },
      { header: 'pin_no', cellValue: this.pinNo },
      { header: 'electricity_number', cellValue: this.electricityNo },
      { header: 'water_number', cellValue: this.waterNo },
      { header: 'property_description', cellValue: this.propertyDescription, columnWidth: 50 },
      { header: 'sub_unit_count', cellValue: this.subUnitCount },
      { header: 'area_in_square_meter', cellValue: this.area },
      { header: 'bed_rooms', cellValue: this.bedRoomsCount },
      { header: 'furniture_status', cellValue: this.furnitureInfo, isLookup: true },
      { header: 'total_rent_value', cellValue: this.rentPaymentAmount },
      { header: 'payment_frequency', cellValue: this.rentPaymentFrequency },
      { header: 'transaction_code', cellValue: this.certificateCode },
      { header: 'documentation_date', cellValue: this.issueDate.slice(0, 10) },
      { header: 'contract_start_date', cellValue: this.startDate.slice(0, 10) },
      { header: 'contract_end_date', cellValue: this.endDate.slice(0, 10) },
      { header: 'occupancy_status', cellValue: this.occupancyStatusInfo, isLookup: true },
    ];
  }
}
